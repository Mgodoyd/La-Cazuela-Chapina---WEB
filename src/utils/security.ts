class SecurityService {
  private static readonly ENCRYPTION_KEY = 'cazuela_chapina_2025';
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly IV_LENGTH = 12;

  // Generar clave de encriptación derivada
  private static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        iterations: 100000,
        hash: 'SHA-256',
        salt,
      },
      baseKey,
      { name: this.ALGORITHM, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encriptar datos
  static async encrypt(data: string): Promise<string> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await this.deriveKey(this.ENCRYPTION_KEY, salt);
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        new TextEncoder().encode(data)
      );

      const result = new Uint8Array(
        salt.length + iv.length + encrypted.byteLength
      );
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(new Uint8Array(encrypted), salt.length + iv.length);

      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Error encriptando datos:', error);
      return data; // Fallback a texto plano si falla la encriptación
    }
  }

  // Desencriptar datos
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const data = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

      const salt = data.slice(0, 16);
      const iv = data.slice(16, 16 + this.IV_LENGTH);
      const encrypted = data.slice(16 + this.IV_LENGTH);

      const key = await this.deriveKey(this.ENCRYPTION_KEY, salt);

      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Error desencriptando datos:', error);
      return encryptedData; // Fallback si falla la desencriptación
    }
  }

  // Hash seguro para IDs
  static async hashId(id: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(id + this.ENCRYPTION_KEY);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 16);
  }

  static clearSensitiveData(): void {
    localStorage.clear();
    // console.log('Datos sensibles limpiados de memoria');
  }
}

export class SecureStorage {
  private static readonly PREFIX = 'cazuela_';
  private static readonly SENSITIVE_KEYS = [
    'token',
    'refreshToken',
    'user',
    'id',
  ];

  static async setItem(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.PREFIX + key;
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);

      if (this.SENSITIVE_KEYS.includes(key)) {
        const encrypted = await SecurityService.encrypt(stringValue);
        localStorage.setItem(fullKey, encrypted);
      } else {
        localStorage.setItem(fullKey, stringValue);
      }
    } catch (error) {
      console.error('Error guardando en secure storage:', error);
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    }
  }

  static async getItem(key: string): Promise<any> {
    try {
      const fullKey = this.PREFIX + key;
      const value = localStorage.getItem(fullKey);

      if (!value) return null;

      if (this.SENSITIVE_KEYS.includes(key)) {
        // Desencriptar datos sensibles
        const decrypted = await SecurityService.decrypt(value);
        try {
          return JSON.parse(decrypted);
        } catch {
          return decrypted;
        }
      } else {
        // Datos no sensibles se devuelven normalmente
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
    } catch (error) {
      console.error('Error obteniendo de secure storage:', error);
      // Fallback a localStorage normal
      const fallbackValue = localStorage.getItem(this.PREFIX + key);
      try {
        return fallbackValue ? JSON.parse(fallbackValue) : null;
      } catch {
        return fallbackValue;
      }
    }
  }

  static removeItem(key: string): void {
    const fullKey = this.PREFIX + key;
    localStorage.removeItem(fullKey);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  static hasItem(key: string): boolean {
    const fullKey = this.PREFIX + key;
    return localStorage.getItem(fullKey) !== null;
  }
}

export default SecurityService;
