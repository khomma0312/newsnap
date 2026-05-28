/**
 * AWS Bedrock（Claude 3 Haiku）で記事の要約を生成する
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "ap-northeast-1",
});

const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

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

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content?.[0]?.text ?? "";
}
