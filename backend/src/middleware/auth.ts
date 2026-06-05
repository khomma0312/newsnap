/**
 * Cognito JWT 検証ミドルウェア
 *
 * Authorization: Bearer <id_token> を検証し、
 * c.set("userId", sub) でユーザー ID を後続のルートへ渡す。
 */

import type { MiddlewareHandler } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { logger } from '../lib/logger.js';

const REGION = process.env.AWS_REGION ?? 'ap-northeast-1';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID ?? '';
const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? '';

const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: CLIENT_ID,
    });

    const userId = payload.sub;
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('userId', userId);
    await next();
  } catch (err) {
    logger.warn({ err, path: c.req.path }, 'Auth failed');
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
