/**
 * AWS Bedrock（Claude Sonnet 4.6）で記事の要約を生成する
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { logger } from "./logger.js";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "ap-northeast-1",
});

const MODEL_ID = "global.anthropic.claude-sonnet-4-6";

export async function generateSummary(
  title: string,
  description: string
): Promise<string> {
  const prompt = `以下のニュース記事を3〜5行で日本語にまとめてください。

タイトル: ${title}
概要: ${description}

要約:`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const start = Date.now();
  const response = await client.send(command);
  logger.info({ modelId: MODEL_ID, durationMs: Date.now() - start }, "Bedrock invoked");

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content?.[0]?.text ?? "";
}
