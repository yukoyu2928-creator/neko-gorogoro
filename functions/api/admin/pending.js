// GET /api/admin/pending
// ゆゆさん専用：承認待ちの投稿一覧を返す
// 認証: ヘッダ X-Admin-Token に管理パスワード

import { jsonResponse, errorResponse, requireAdmin } from '../../_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  const authError = requireAdmin(request, env);
  if (authError) return authError;

  if (!env.NEKO_BUCKET) {
    return errorResponse('サーバー設定エラー', 500);
  }

  const listed = await env.NEKO_BUCKET.list({
    prefix: 'pending/',
    limit: 200,
  });

  const cats = [];
  for (const obj of listed.objects) {
    if (!obj.key.endsWith('.json')) continue;

    try {
      const json = await env.NEKO_BUCKET.get(obj.key);
      if (!json) continue;
      const meta = await json.json();
      cats.push(meta);
    } catch (err) {
      continue;
    }
  }

  cats.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));

  return jsonResponse({ cats, count: cats.length });
}
