// GET /api/list
// 公開された（承認済み）「みんなの猫」の一覧を返す

import { jsonResponse, errorResponse } from '../_lib.js';

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.NEKO_BUCKET) {
    return errorResponse('サーバー設定エラー', 500);
  }

  // published/ 下の .json ファイル一覧を取得
  const listed = await env.NEKO_BUCKET.list({
    prefix: 'published/',
    limit: 200,
  });

  const cats = [];
  for (const obj of listed.objects) {
    if (!obj.key.endsWith('.json')) continue;

    try {
      const json = await env.NEKO_BUCKET.get(obj.key);
      if (!json) continue;
      const meta = await json.json();

      // 公開用に必要な情報だけ抜粋（uploaderEmailは隠す）
      cats.push({
        id: meta.id,
        name: meta.name,
        breed: meta.breed || '',
        description: meta.description || '',
        hasPhoto: !!meta.photoKey,
        audioType: meta.audioType,
        publishedAt: meta.publishedAt || meta.uploadedAt,
      });
    } catch (err) {
      // 壊れたメタデータは無視
      continue;
    }
  }

  // 新しい順にソート
  cats.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  return jsonResponse({ cats, count: cats.length });
}
