// POST /api/admin/delete-published
// ゆゆさん専用：公開済みの投稿を後から削除

import { jsonResponse, errorResponse, requireAdmin } from '../../_lib.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  const authError = requireAdmin(request, env);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('リクエストが正しくありません');
  }

  const id = body.id;
  if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(id)) {
    return errorResponse('不正なIDです');
  }

  const metaObj = await env.NEKO_BUCKET.get(`published/${id}.json`);
  if (!metaObj) {
    return errorResponse('該当の投稿が見つかりません', 404);
  }
  const meta = await metaObj.json();

  const deleteKeys = [`published/${id}.json`, meta.audioKey, meta.photoKey].filter(Boolean);
  for (const key of deleteKeys) {
    await env.NEKO_BUCKET.delete(key);
  }

  return jsonResponse({ ok: true, id, message: '公開済み投稿を削除しました' });
}
