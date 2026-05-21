// POST /api/upload
// みんなが猫の音を投稿するAPI
// 受け取った音声・写真・メタデータを R2 の pending/ に保存

import {
  makeId,
  jsonResponse,
  errorResponse,
  sanitizeText,
  getExtension,
  isAllowedAudio,
  isAllowedImage,
} from '../_lib.js';

// ファイルサイズ上限（10MB）
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export async function onRequestPost(context) {
  const { request, env } = context;

  // R2 バケットが設定されているか確認
  if (!env.NEKO_BUCKET) {
    return errorResponse('サーバー側の設定エラーです（R2が見つかりません）', 500);
  }

  // FormData として受け取る
  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return errorResponse('フォームデータが正しくありません');
  }

  // 入力フィールドを取得
  const name = sanitizeText(formData.get('name'), 30);
  const breed = sanitizeText(formData.get('breed'), 30);
  const description = sanitizeText(formData.get('description'), 200);
  const uploaderEmail = sanitizeText(formData.get('email'), 200);
  const audioFile = formData.get('audio');
  const photoFile = formData.get('photo');

  // バリデーション
  if (!name) {
    return errorResponse('猫の名前を入力してください');
  }
  if (!audioFile || typeof audioFile === 'string') {
    return errorResponse('音声ファイルを選んでください');
  }
  if (!isAllowedAudio(audioFile.type)) {
    return errorResponse('音声ファイルの形式が対応していません（mp3, m4a, wav, ogg のみ）');
  }
  if (audioFile.size > MAX_AUDIO_SIZE) {
    return errorResponse('音声ファイルは10MB以下にしてください');
  }

  let photoData = null;
  if (photoFile && typeof photoFile !== 'string' && photoFile.size > 0) {
    if (!isAllowedImage(photoFile.type)) {
      return errorResponse('写真の形式が対応していません（jpg, png, webp のみ）');
    }
    if (photoFile.size > MAX_PHOTO_SIZE) {
      return errorResponse('写真は5MB以下にしてください');
    }
    photoData = photoFile;
  }

  // ID生成
  const id = makeId();
  const now = new Date().toISOString();

  // 音声ファイルを R2 に保存
  const audioExt = getExtension(audioFile.type);
  const audioKey = `pending/${id}.${audioExt}`;
  await env.NEKO_BUCKET.put(audioKey, audioFile.stream(), {
    httpMetadata: { contentType: audioFile.type },
  });

  // 写真があれば保存
  let photoKey = null;
  if (photoData) {
    const photoExt = getExtension(photoData.type);
    photoKey = `pending/${id}.${photoExt}`;
    await env.NEKO_BUCKET.put(photoKey, photoData.stream(), {
      httpMetadata: { contentType: photoData.type },
    });
  }

  // メタデータJSONを保存
  const metadata = {
    id,
    name,
    breed,
    description,
    audioKey,
    photoKey,
    audioType: audioFile.type,
    photoType: photoData?.type || null,
    uploaderEmail: uploaderEmail || null,
    uploadedAt: now,
    status: 'pending',
  };

  const metaKey = `pending/${id}.json`;
  await env.NEKO_BUCKET.put(metaKey, JSON.stringify(metadata, null, 2), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });

  return jsonResponse({
    ok: true,
    id,
    message: '投稿を受け付けました！運営者の確認後、公開されます🐾',
  });
}
