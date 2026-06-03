/**
 * /auth  認証関連エンドポイント
 *
 * POST /auth/token    - authorization_code を Cognito のトークンエンドポイントと交換
 * POST /auth/refresh  - refresh_token で id_token を再取得（REFRESH_TOKEN_AUTH）
 */

import { Hono } from "hono";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";
import { logger } from "../lib/logger.js";

const router = new Hono();

const REGION = process.env.AWS_REGION ?? "ap-northeast-1";
const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN ?? "";
const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.COGNITO_REDIRECT_URI ?? "";

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

function computeSecretHash(username: string): string {
  return createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

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
    const body = await res.text();
    logger.warn({ status: res.status, body }, "Token exchange failed");
    return c.json({ error: "Token exchange failed" }, 400);
  }

  const tokens = await res.json() as { id_token: string; refresh_token: string };
  logger.info("Token exchange succeeded");
  return c.json({ id_token: tokens.id_token, refresh_token: tokens.refresh_token });
});

// username は id_token の cognito:username クレーム（フロントエンドが渡す）
router.post("/refresh", async (c) => {
  const { refresh_token, username } = await c.req.json<{ refresh_token: string; username: string }>();

  const authParameters: Record<string, string> = {
    REFRESH_TOKEN: refresh_token,
  };
  if (CLIENT_SECRET) {
    authParameters.SECRET_HASH = computeSecretHash(username);
  }

  try {
    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: authParameters,
      })
    );

    const idToken = result.AuthenticationResult?.IdToken;
    if (!idToken) {
      return c.json({ error: "Refresh failed" }, 400);
    }
    return c.json({ id_token: idToken });
  } catch (err) {
    logger.warn({ err }, "Token refresh failed");
    return c.json({ error: "Refresh failed" }, 400);
  }
});

export default router;
