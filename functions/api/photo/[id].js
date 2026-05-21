// GET /api/photo/[id]
// 公開された猫の写真を配信

import { errorResponse, CORS_HEADERS } from '../../_lib.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.NEKO_BUCKET || !id) {
    return errorResponse('Not found', 404);
  }

  const metaObj = await env.NEKO_BUCKET.get(`published/${id}.json`);
  if (!metaObj) {
    return errorResponse('Not found', 404);
  }

  const meta = await metaObj.json();
  if (!meta.photoKey) {
    return errorResponse('No photo', 404);
  }

  const photoObj = await env.NEKO_BUCKET.get(meta.photoKey);
  if (!photoObj) {
    return errorResponse('Photo file missing', 404);
  }

  return new Response(photoObj.body, {
    headers: {
      'Content-Type': meta.photoType || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
      ...CORS_HEADERS,
    },
  });
}
