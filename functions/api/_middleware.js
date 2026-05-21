// /api/ 配下の全エンドポイントに共通する処理
// CORS のプリフライトリクエスト（OPTIONS）をここで一括処理

import { CORS_HEADERS } from '../_lib.js';

export async function onRequest(context) {
  // プリフライト（OPTIONS）は即時 200 を返す
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  // それ以外は通常通り次のハンドラへ
  return context.next();
}
