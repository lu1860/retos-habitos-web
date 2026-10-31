import type { AuthToken, StoredSession, User } from "../domain/auth";

const STORAGE_KEY = "retos-habitos.session";

// Se guarda el último texto leído y su versión ya convertida: React pide la sesión
// en cada render y debe recibir el MISMO objeto mientras no cambie (useSyncExternalStore).
let cachedRaw: string | null = null;
let cachedSession: StoredSession | null = null;
// Por qué terminó la última sesión, para avisar en el login que expiró
let endedByExpiration = false;
const listeners = new Set<() => void>();

const isStoredSession = (value: unknown): value is StoredSession => {
  const session = value as StoredSession | null;
  return (
    typeof session?.expiresAt === "number" &&
    typeof session.token?.accessToken === "string" &&
    typeof session.user?.id === "number" &&
    (session.user.rol === "admin" || session.user.rol === "user")
  );
};

const parse = (raw: string | null): StoredSession | null => {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    // Una sesión vencida o con otra forma se trata como si no hubiera sesión
    return isStoredSession(value) && value.expiresAt > Date.now() ? value : null;
  } catch {
    return null;
  }
};

const readRaw = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // almacenamiento bloqueado por el navegador
  }
};

const write = (session: StoredSession | null) => {
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Si el navegador no deja guardar, la sesión dura solo mientras la pestaña esté abierta
  }
  listeners.forEach((listener) => listener());
};

/**
 * Sesión guardada en localStorage: sobrevive al refrescar la página.
 * Es la única parte del frontend que sabe dónde está guardado el token.
 */
export const sessionStore = {
  /** Sesión actual (null si no hay o venció). */
  getSnapshot(): StoredSession | null {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSession = parse(raw);
    }
    return cachedSession;
  },

  /** Avisa a React cuando la sesión cambia, también si cambia en otra pestaña. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  /** Token para el header Authorization, o null. */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStore.getSnapshot()?.token.accessToken ?? null;
  },

  save(user: User, token: AuthToken): void {
    endedByExpiration = false;
    write({ user, token, expiresAt: Date.now() + token.expiresIn * 1000 });
  },

  /** Actualiza los datos del usuario sin tocar el token (después de GET /auth/me). */
  updateUser(user: User): void {
    const current = sessionStore.getSnapshot();
    if (current) write({ ...current, user });
  },

  /** Cierra la sesión. expired = true si fue porque el token venció o la API respondió 401. */
  clear(expired = false): void {
    endedByExpiration = expired;
    write(null);
  },

  /** true una sola vez después de que la sesión terminó por vencimiento. */
  consumeExpiration(): boolean {
    const expired = endedByExpiration;
    endedByExpiration = false;
    return expired;
  },
};
