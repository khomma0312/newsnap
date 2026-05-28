/**
 * /auth  認証関連エンドポイント
 *
 * POST /auth/token  - authorization_code を Cognito のトークンエンドポイントと交換
 */

import { Hono } from "hono";

const router = new Hono();

const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN ?? "";
const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.COGNITO_REDIRECT_URI ?? "";

router.post("/token", async (c) => {
  const { code } = await c.req.json<{ code: string }>();

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code,
  });

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: params,
  });

  if (!res.ok) {
    return c.json({ error: "Token exchange failed" }, 400);
  }

  const tokens = await res.json();
  return c.json({ id_token: tokens.id_token });
});

export default router;
