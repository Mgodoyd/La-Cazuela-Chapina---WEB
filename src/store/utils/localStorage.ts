const NAMESPACE = 'cazuela_chapina';

export function saveToStorage<T>(key: string, value: T): void {
  try {
    const namespacedKey = `${NAMESPACE}:${key}`;
    localStorage.setItem(namespacedKey, JSON.stringify(value));
  } catch {}
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const namespacedKey = `${NAMESPACE}:${key}`;
    const raw = localStorage.getItem(namespacedKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
