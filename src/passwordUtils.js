// ── UTILITÁRIO DE SENHAS SEGURAS ─────────────────────────────────────────────
// Usa Web Crypto API (nativa no browser) — sem dependências externas.

const CHARS = {
  maiusculas: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  minusculas: "abcdefghijklmnopqrstuvwxyz",
  numeros:    "0123456789",
  simbolos:   "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

/**
 * Gera bytes criptograficamente aleatórios.
 */
function bytesAleatorios(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

/**
 * Gera uma senha segura com os critérios escolhidos.
 * @param {number} comprimento - Tamanho da senha (mín. 8, máx. 128)
 * @param {{ maiusculas, minusculas, numeros, simbolos }} opcoes
 * @returns {string}
 */
export function gerarSenhaSegura(comprimento = 16, opcoes = {}) {
  const cfg = {
    maiusculas: true,
    minusculas: true,
    numeros:    true,
    simbolos:   true,
    ...opcoes,
  };

  comprimento = Math.max(8, Math.min(128, comprimento));

  let alfabeto = "";
  const obrigatorios = [];

  for (const [k, chars] of Object.entries(CHARS)) {
    if (cfg[k]) {
      alfabeto += chars;
      // Garante ao menos 1 char de cada categoria ativa
      obrigatorios.push(chars[bytesAleatorios(1)[0] % chars.length]);
    }
  }

  if (!alfabeto) throw new Error("Selecione ao menos um tipo de caractere.");
  if (obrigatorios.length > comprimento) throw new Error("Comprimento menor que o número de categorias ativas.");

  const bytes = bytesAleatorios(comprimento);
  const senha = Array.from(bytes, b => alfabeto[b % alfabeto.length]);

  // Injeta os obrigatórios em posições aleatórias
  const posicoes = [...bytesAleatorios(obrigatorios.length)].map(
    (b, i) => (b % (comprimento - i)) + i
  );
  posicoes.forEach((pos, i) => { senha[pos] = obrigatorios[i]; });

  return senha.join("");
}

/**
 * Avalia a força de uma senha.
 * @param {string} senha
 * @returns {{ pontuacao: number, nivel: string, cor: string, dicas: string[] }}
 */
export function avaliarForca(senha) {
  if (!senha) return { pontuacao: 0, nivel: "Vazia", cor: "#ccc", dicas: [] };

  let pts = 0;
  const dicas = [];

  if (senha.length >= 8)  pts += 1; else dicas.push("Use pelo menos 8 caracteres.");
  if (senha.length >= 12) pts += 1; else if (senha.length >= 8) dicas.push("Prefira 12 ou mais caracteres.");
  if (senha.length >= 16) pts += 1;
  if (/[A-Z]/.test(senha)) pts += 1; else dicas.push("Adicione letras maiúsculas.");
  if (/[a-z]/.test(senha)) pts += 1; else dicas.push("Adicione letras minúsculas.");
  if (/[0-9]/.test(senha)) pts += 1; else dicas.push("Adicione números.");
  if (/[^A-Za-z0-9]/.test(senha)) pts += 1; else dicas.push("Adicione símbolos (!@#$...).");
  if (!/(.)\1{2,}/.test(senha)) pts += 1; else dicas.push("Evite repetir o mesmo caractere 3x seguidas.");
  if (!/^(123|abc|qwe|senha|pass)/i.test(senha)) pts += 1; else dicas.push("Evite sequências óbvias.");

  const niveis = [
    { min: 0, nivel: "Muito Fraca", cor: "#CC4444" },
    { min: 3, nivel: "Fraca",       cor: "#E07020" },
    { min: 5, nivel: "Média",       cor: "#C9A030" },
    { min: 7, nivel: "Forte",       cor: "#52C97A" },
    { min: 9, nivel: "Muito Forte", cor: "#1A9E50" },
  ];

  const { nivel, cor } = [...niveis].reverse().find(n => pts >= n.min);
  return { pontuacao: pts, nivelMax: 9, nivel, cor, dicas };
}

// ── HASH COM WEB CRYPTO API (PBKDF2) ─────────────────────────────────────────

const ALGORITMO   = "SHA-256";
const ITERACOES   = 300_000;
const TAM_SALT    = 16;
const TAM_KEY     = 32;

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes.buffer;
}

/**
 * Gera um hash seguro da senha usando PBKDF2 + SHA-256.
 * @param {string} senha
 * @returns {Promise<string>} String no formato "salt:hash"
 */
export async function hashSenha(senha) {
  const salt = crypto.getRandomValues(new Uint8Array(TAM_SALT));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: ALGORITMO, salt, iterations: ITERACOES },
    keyMaterial, TAM_KEY * 8
  );
  return `${bufToHex(salt)}:${bufToHex(bits)}`;
}

/**
 * Verifica se a senha corresponde ao hash armazenado.
 * @param {string} senha
 * @param {string} hashArmazenado - Formato "salt:hash"
 * @returns {Promise<boolean>}
 */
export async function verificarSenha(senha, hashArmazenado) {
  try {
    const [saltHex, hashHex] = hashArmazenado.split(":");
    if (!saltHex || !hashHex) return false;
    const salt = new Uint8Array(hexToBuf(saltHex));
    const keyMaterial = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: ALGORITMO, salt, iterations: ITERACOES },
      keyMaterial, TAM_KEY * 8
    );
    // Comparação em tempo constante para evitar timing attacks
    const a = new Uint8Array(bits);
    const b = new Uint8Array(hexToBuf(hashHex));
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch {
    return false;
  }
}
