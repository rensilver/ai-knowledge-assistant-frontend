// Token persistence, isolated behind this module so it can later move to an
// httpOnly cookie without changing any call site (see README security notes).
const TOKEN_KEY = "aika_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
