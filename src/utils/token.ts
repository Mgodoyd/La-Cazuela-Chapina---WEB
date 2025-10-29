const padding = (input: string): string => {
  const remainder = input.length % 4;
  if (remainder === 2) return `${input}==`;
  if (remainder === 3) return `${input}=`;
  if (remainder === 1) return `${input}===`;
  return input;
};

const base64UrlDecode = (input: string): string => {
  const normalized = padding(input.replace(/-/g, '+').replace(/_/g, '/'));
  if (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).atob === 'function'
  ) {
    return (globalThis as any).atob(normalized);
  }
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).Buffer &&
    typeof (globalThis as any).Buffer.from === 'function'
  ) {
    return (globalThis as any).Buffer.from(normalized, 'base64').toString(
      'binary'
    );
  }
  throw new Error('Base64 decoding is not supported in this environment.');
};

export const decodeTokenPayload = (
  token: string
): Record<string, unknown> | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = decodeURIComponent(
      base64UrlDecode(payload)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return null;
  }
  return payload.exp;
};

export const isTokenExpired = (
  token: string,
  offsetSeconds: number = 0
): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + offsetSeconds;
};
