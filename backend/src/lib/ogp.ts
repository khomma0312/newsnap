/**
 * URL から OGP メタ情報（タイトル・説明・画像）を取得する
 */

type OgpData = {
  title: string;
  description: string;
  image: string | null;
};

export async function fetchOgp(url: string): Promise<OgpData> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'NewsnapBot/1.0' },
    redirect: 'follow',
  });

  const html = await res.text();

  const get = (property: string): string | null => {
    const match =
      new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i').exec(html) ??
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i').exec(html);
    return match?.[1] ?? null;
  };

  const titleTag = /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1] ?? null;

  return {
    title: get('title') ?? titleTag ?? url,
    description: get('description') ?? '',
    image: get('image'),
  };
}
