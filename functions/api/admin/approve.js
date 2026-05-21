// POST /api/admin/approve
// ゆゆさん専用：投稿を承認 → pending/ から published/ に移動

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
  if (!id || typeof id !== 'string') {
    return errorResponse('id が指定されていません');
  }

  // 安全のため：IDに変な文字が含まれてないかチェック
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return errorResponse('不正なIDです');
  }

  // pendingのメタデータを読む
  const metaObj = await env.NEKO_BUCKET.get(`pending/${id}.json`);
  if (!metaObj) {
    return errorResponse('該当の投稿が見つかりません', 404);
  }
  const meta = await metaObj.json();

  // 公開時刻を追加してメタデータ更新
  const publishedMeta = {
    ...meta,
    status: 'published',
    publishedAt: new Date().toISOString(),
    audioKey: meta.audioKey?.replace('pending/', 'published/'),
    photoKey: meta.photoKey?.replace('pending/', 'published/'),
  };

  // 音声ファイルをコピー（pending → published）
  if (meta.audioKey) {
    const audio = await env.NEKO_BUCKET.get(meta.audioKey);
    if (audio) {
      await env.NEKO_BUCKET.put(publishedMeta.audioKey, audio.body, {
        httpMetadata: { contentType: meta.audioType },
      });
    }
  }

  // 写真もコピー
  if (meta.photoKey) {
    const photo = await env.NEKO_BUCKET.get(meta.photoKey);
    if (photo) {
      await env.NEKO_BUCKET.put(publishedMeta.photoKey, photo.body, {
        httpMetadata: { contentType: meta.photoType },
      });
    }
  }

  // メタデータも published/ に保存
  await env.NEKO_BUCKET.put(`published/${id}.json`, JSON.stringify(publishedMeta, null, 2), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });

  // pending/ の元ファイルを削除
  const deleteKeys = [`pending/${id}.json`, meta.audioKey, meta.photoKey].filter(Boolean);
  for (const key of deleteKeys) {
    await env.NEKO_BUCKET.delete(key);
  }

  return jsonResponse({ ok: true, id, message: '承認しました' });
}
