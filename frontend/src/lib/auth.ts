/**
 * Cognito Hosted UI 認証ヘルパー
 */

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "";
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI ?? "";

export function buildLoginUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "openid email profile",
  });
  return `${COGNITO_DOMAIN}/login?${params}`;
}

export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: process.env.NEXT_PUBLIC_APP_URL ?? "",
  });
  return `${COGNITO_DOMAIN}/logout?${params}`;
}

export function getIdToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("id_token")
    : null;
}

export function getRefreshToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("refresh_token")
    : null;
}

export function saveTokens(idToken: string, refreshToken?: string): void {
  localStorage.setItem("id_token", idToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");
}

export function isLoggedIn(): boolean {
  return !!getIdToken();
}

/** id_token の payload を base64 デコードして返す（署名検証なし）*/
function decodeTokenPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
}

export async function refreshIdToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  const idToken = getIdToken();
  if (!refreshToken || !idToken) return null;

  const payload = decodeTokenPayload(idToken);
  const username = (payload["cognito:username"] ?? payload["sub"]) as string;

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, username }),
  });

  if (!res.ok) return null;
  const data = await res.json() as { id_token: string };
  saveTokens(data.id_token);
  return data.id_token;
}
