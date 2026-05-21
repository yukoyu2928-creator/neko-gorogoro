// GET /api/audio/[id]
// 公開された猫の音声ファイルを配信

import { errorResponse } from '../../_lib.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.NEKO_BUCKET || !id) {
    return errorResponse('Not found', 404);
  }

  // メタデータを読み込んで audioKey を取得
  const metaObj = await env.NEKO_BUCKET.get(`published/${id}.json`);
  if (!metaObj) {
    return errorResponse('Not found', 404);
  }

  const meta = await metaObj.json();
  if (!meta.audioKey) {
    return errorResponse('Audio not found', 404);
  }

  // 音声ファイル本体を取得
  const audioObj = await env.NEKO_BUCKET.get(meta.audioKey);
  if (!audioObj) {
    return errorResponse('Audio file missing', 404);
  }

  return new Response(audioObj.body, {
    headers: {
      'Content-Type': meta.audioType || 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
      'Accept-Ranges': 'bytes',
    },
  });
}
