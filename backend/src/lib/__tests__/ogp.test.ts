import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchOgp } from '../ogp.js';

const mockFetch = (html: string): void => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: () => Promise.resolve(html) }));
};

describe('fetchOgp', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('og:title / og:image / og:description を取得する', async () => {
    mockFetch(`
      <html><head>
        <meta property="og:title" content="OGP Title" />
        <meta property="og:image" content="https://example.com/img.jpg" />
        <meta property="og:description" content="OGP description" />
      </head></html>
    `);

    const result = await fetchOgp('https://example.com/article');

    expect(result.title).toBe('OGP Title');
    expect(result.image).toBe('https://example.com/img.jpg');
    expect(result.description).toBe('OGP description');
  });

  it('OGP タグがない場合は <title> にフォールバックする', async () => {
    mockFetch('<html><head><title>Fallback Title</title></head></html>');

    const result = await fetchOgp('https://example.com');

    expect(result.title).toBe('Fallback Title');
    expect(result.image).toBeNull();
    expect(result.description).toBe('');
  });

  it('OGP も <title> もない場合は URL をタイトルにする', async () => {
    mockFetch('<html><head></head></html>');

    const result = await fetchOgp('https://example.com/no-title');

    expect(result.title).toBe('https://example.com/no-title');
  });
});
