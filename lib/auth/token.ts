export const ADMIN_COOKIE_NAME = 'mfe_admin_session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSessionPayload {
  user: string;
  role: 'super_admin';
  exp: number;
}

// Edge-compatible HMAC token handling via Web Crypto API (supported natively in Vercel Edge & Node.js)
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createAdminSessionToken(username: string): Promise<string> {
  const secret = (process.env.ADMIN_JWT_SECRET || 'mfe-brand-secure-session-fallback-secret-2026').replace(/^['"]|['"]$/g, '').trim();
  const key = await getCryptoKey(secret);

  const payload: AdminSessionPayload = {
    user: username,
    role: 'super_admin',
    exp: Date.now() + SESSION_EXPIRY_MS,
  };

  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(enc.encode(payloadStr));

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(payloadB64)
  );
  const sigB64 = base64UrlEncode(signature);

  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    if (!token || !token.includes('.')) return null;
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;

    const secret = (process.env.ADMIN_JWT_SECRET || 'mfe-brand-secure-session-fallback-secret-2026').replace(/^['"]|['"]$/g, '').trim();
    const key = await getCryptoKey(secret);

    const enc = new TextEncoder();
    const signatureBytes = base64UrlDecode(sigB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      enc.encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const dec = new TextDecoder();
    const payload: AdminSessionPayload = JSON.parse(dec.decode(payloadBytes));

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
