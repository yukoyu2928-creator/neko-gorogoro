// 共通ユーティリティ
// 全API関数で使う関数を集めたファイル

// UUIDっぽいID生成（猫の投稿1件ずつに付与する識別子）
export function makeId() {
  // crypto.randomUUID() は Workers でも使える
  return crypto.randomUUID();
}

// JSON 形式でレスポンスを返す
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

// エラーレスポンス
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// 管理者認証チェック
// 環境変数 ADMIN_PASSWORD と、リクエストヘッダ X-Admin-Token を比較
export function requireAdmin(request, env) {
  const token = request.headers.get('X-Admin-Token') || '';
  const expected = env.ADMIN_PASSWORD || '';
  if (!expected) {
    return errorResponse('ADMIN_PASSWORD が設定されていません', 500);
  }
  if (token !== expected) {
    return errorResponse('管理者認証が必要です', 401);
  }
  return null;  // OKの場合は null
}

// 文字列のサニタイズ（NULL文字や制御文字を除去）
export function sanitizeText(str, maxLength = 100) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, maxLength)
    .trim();
}

// ファイルタイプから拡張子を取得
export function getExtension(mimeType) {
  const map = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mimeType?.toLowerCase()] || null;
}

// 許可された音声形式か？
export function isAllowedAudio(mimeType) {
  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm'];
  return allowed.includes(mimeType?.toLowerCase());
}

// 許可された画像形式か？
export function isAllowedImage(mimeType) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowed.includes(mimeType?.toLowerCase());
}
