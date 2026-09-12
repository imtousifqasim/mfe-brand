import crypto from 'crypto';

// Base32 alphabet used by standard TOTP authenticators (RFC 3548 / RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length: number = 20): string {
  const randomBytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < randomBytes.length; i++) {
    result += BASE32_CHARS[randomBytes[i] % 32];
  }
  return result;
}

function base32ToBuffer(base32: string): Buffer {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanBase32.length; i++) {
    const char = cleanBase32[i];
    const index = BASE32_CHARS.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTOTPCode(secret: string, timestamp: number = Date.now(), step: number = 30): string {
  const counter = Math.floor(timestamp / 1000 / step);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const key = base32ToBuffer(secret);
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

export function verifyTOTPCode(
  secret: string,
  userToken: string,
  window: number = 1,
  step: number = 30
): boolean {
  if (!secret || !userToken) return false;
  const cleanToken = userToken.trim().replace(/\s+/g, '');
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  const now = Date.now();
  for (let i = -window; i <= window; i++) {
    const checkTime = now + i * step * 1000;
    const generated = generateTOTPCode(secret, checkTime, step);
    if (generated === cleanToken) {
      return true;
    }
  }
  return false;
}

export function getTOTPUri(
  accountName: string,
  secret: string,
  issuer: string = 'MFE Brand'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export function getQRCodeUrl(otpauthUri: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(otpauthUri)}`;
}
