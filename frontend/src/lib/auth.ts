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

export function saveTokens(params: URLSearchParams): void {
  const idToken = params.get("id_token");
  if (idToken) localStorage.setItem("id_token", idToken);
}

export function clearTokens(): void {
  localStorage.removeItem("id_token");
}

export function getIdToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("id_token")
    : null;
}

export function isLoggedIn(): boolean {
  return !!getIdToken();
}
