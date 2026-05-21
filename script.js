/* ============================================
   🐾 ねこゴロゴロ癒し — 動きの仕組み 🌸
   ============================================ */

// ============================================
// 0. 最初から入っている10匹のデフォルト猫
//   各猫は実在の本物の音源（CC0 / CC-BY）を使用。
//   playbackRate（再生速度）で個性を演出します。
// ============================================

const DEFAULT_CATS = [
  {
    name: 'ミケちゃん',
    breed: '三毛猫',
    defaultEmoji: '🐱',
    defaultImage: './cats/cat-mike.png',
    audioPath: './sounds/bigsoundbank-1010.mp3',
    audioFileName: 'mike-gorogoro.mp3',
    playbackRate: 1.0,
  },
  {
    name: 'クロちゃん',
    breed: '黒猫',
    defaultEmoji: '🐈‍⬛',
    defaultImage: './cats/cat-kuro.png',
    audioPath: './sounds/bigsoundbank-0436.mp3',
    audioFileName: 'kuro-gorogoro.mp3',
    playbackRate: 1.0,
  },
  {
    name: 'キジくん',
    breed: 'キジトラ',
    defaultEmoji: '🐈',
    defaultImage: './cats/cat-kiji.png',
    audioPath: './sounds/bigsoundbank-0981.mp3',
    audioFileName: 'kiji-gorogoro.mp3',
    playbackRate: 1.0,
  },
  {
    name: 'チャタくん',
    breed: '茶トラ',
    defaultEmoji: '🐾',
    defaultImage: './cats/cat-chata.png',
    audioPath: './sounds/orangefreesounds.mp3',
    audioFileName: 'chata-gorogoro.mp3',
    playbackRate: 1.0,
  },
  {
    name: 'ペルー姫',
    breed: 'ペルシャ',
    defaultEmoji: '😺',
    defaultImage: './cats/cat-peru.png',
    audioPath: './sounds/bigsoundbank-0436.mp3',
    audioFileName: 'peru-gorogoro.mp3',
    playbackRate: 0.9,
  },
  {
    name: 'ブルーくん',
    breed: 'ロシアンブルー',
    defaultEmoji: '💎',
    defaultImage: './cats/cat-blue.png',
    audioPath: './sounds/bigsoundbank-1010.mp3',
    audioFileName: 'blue-gorogoro.mp3',
    playbackRate: 0.85,
  },
  {
    name: 'クーンさん',
    breed: 'メインクーン',
    defaultEmoji: '🦁',
    defaultImage: './cats/cat-coon.png',
    audioPath: './sounds/bigsoundbank-0981.mp3',
    audioFileName: 'coon-gorogoro.mp3',
    playbackRate: 0.75,
  },
];

// 旧バージョンで登録された猫を削除するための名前リスト
const REMOVED_DEFAULT_CAT_NAMES = ['シャム王子', 'アメちゃん', 'フォルちゃん'];

// 🎵 音楽だけモード用の癒し音楽（すべてパブリックドメイン）
const MUSIC_TRACKS = [
  {
    name: '静かなピアノ',
    desc: 'しっとり落ち着くピアノ曲',
    emoji: '🎹',
    path: './music/music-calm-piano.mp3',
  },
  {
    name: '夢見るピアノ',
    desc: 'ふんわり夢の中みたいな',
    emoji: '🌙',
    path: './music/music-dreamy-piano.mp3',
  },
  {
    name: '陽だまりの平和',
    desc: 'あたたかい昼下がりに',
    emoji: '☀️',
    path: './music/music-peace-sunlight.mp3',
  },
  {
    name: '静かな夜',
    desc: 'おやすみ前にぴったり',
    emoji: '🌃',
    path: './music/music-quiet-night.mp3',
  },
  {
    name: '可愛いウクレレ',
    desc: 'ほのぼの・ゆるかわ',
    emoji: '🎶',
    path: './music/music-ukulele-love.mp3',
  },
];

// ============================================
// 1. データ保存の準備（IndexedDB）
//   ※ 大きな音声ファイルもブラウザに安全に保存できる仕組み
// ============================================

const DB_NAME = 'nekoGorogoroDB';
const DB_VERSION = 1;
const STORE_NAME = 'cats';
let db = null;

// データベースを開く（または作る）
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    // 初回だけ：保存場所（テーブル）を作る
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

// 全ての猫を取得
function getAllCats() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// 猫を追加
function addCat(cat) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(cat);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 猫を更新
function updateCat(cat) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(cat);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 猫を削除
function deleteCat(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// 2. アプリ全体の状態（覚えておくこと）
// ============================================

const state = {
  cats: [],                    // 猫のリスト
  filter: 'all',               // 'all' か 'favorites'
  currentlyPlayingId: null,    // 今再生中の猫のID
  audioElement: null,          // 再生用の<audio>要素
  currentObjectURL: null,      // 今使ってる音声のURL（後で解放するため）
  volume: 0.7,                 // 音量（0.0〜1.0）
  timerSeconds: 0,             // タイマー設定（0=なし）
  timerInterval: null,         // タイマーの内部ID
  timerEndsAt: null,           // タイマーが終わる時刻
};

// ============================================
// 3. 各部品（HTML要素）への参照を取得
// ============================================

const el = {
  catList: document.getElementById('cat-list'),
  musicList: document.getElementById('music-list'),
  emptyState: document.getElementById('empty-state'),
  communitySection: document.getElementById('community-section'),
  addBtnEl: document.getElementById('add-btn'),
  volume: document.getElementById('volume'),
  volumeValue: document.getElementById('volume-value'),
  timer: document.getElementById('timer'),
  timerRemaining: document.getElementById('timer-remaining'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  addBtn: document.getElementById('add-btn'),
  modal: document.getElementById('modal'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalTitle: document.getElementById('modal-title'),
  catForm: document.getElementById('cat-form'),
  catName: document.getElementById('cat-name'),
  catBreed: document.getElementById('cat-breed'),
  catPhoto: document.getElementById('cat-photo'),
  catAudio: document.getElementById('cat-audio'),
  photoPreview: document.getElementById('photo-preview'),
  audioPreview: document.getElementById('audio-preview'),
  cancelBtn: document.getElementById('cancel-btn'),
  shareMenu: document.getElementById('share-menu'),
  shareOverlay: document.getElementById('share-overlay'),
  downloadBtn: document.getElementById('download-btn'),
  shareCloseBtn: document.getElementById('share-close-btn'),
  confirmDialog: document.getElementById('confirm-dialog'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmYes: document.getElementById('confirm-yes'),
  confirmNo: document.getElementById('confirm-no'),
  resetDefaultsBtn: document.getElementById('reset-defaults-btn'),
  backupBtn: document.getElementById('backup-btn'),
  restoreInput: document.getElementById('restore-input'),
  themeToggle: document.getElementById('theme-toggle'),
  modalDeleteSection: document.getElementById('modal-delete-section'),
  modalDeleteBtn: document.getElementById('modal-delete-btn'),
  // みんなの猫
  communityList: document.getElementById('community-list'),
  communityStatus: document.getElementById('community-status'),
  communityUploadBtn: document.getElementById('community-upload-btn'),
  communityRefreshBtn: document.getElementById('community-refresh-btn'),
  uploadModal: document.getElementById('upload-modal'),
  uploadModalOverlay: document.getElementById('upload-modal-overlay'),
  uploadForm: document.getElementById('upload-form'),
  uploadName: document.getElementById('upload-name'),
  uploadBreed: document.getElementById('upload-breed'),
  uploadDescription: document.getElementById('upload-description'),
  uploadPhoto: document.getElementById('upload-photo'),
  uploadAudio: document.getElementById('upload-audio'),
  uploadEmail: document.getElementById('upload-email'),
  uploadPhotoPreview: document.getElementById('upload-photo-preview'),
  uploadAudioPreview: document.getElementById('upload-audio-preview'),
  uploadCancelBtn: document.getElementById('upload-cancel-btn'),
  uploadSubmitBtn: document.getElementById('upload-submit-btn'),
};

// ============================================
// 4. 編集中の状態（フォームで使う一時的な情報）
// ============================================

const editing = {
  catId: null,        // 編集する猫のID（追加の場合はnull）
  photoBlob: null,    // 選んだ写真ファイル
  audioBlob: null,    // 選んだ音声ファイル
  audioFileName: '',  // 元のファイル名（ダウンロード時に使う）
};

let pendingConfirm = null;       // 確認ダイアログのコールバック
let pendingShareCatId = null;    // 共有メニューが開いてる猫のID
let musicPlayingIndex = null;    // 再生中の音楽のindex（なければnull）
let communityCats = [];          // 「みんなの猫」一覧
let communityPlayingId = null;   // 「みんなの猫」で再生中のID

// ============================================
// 5. 猫リストの表示
// ============================================

function render() {
  // 「みんなの猫」モード
  if (state.filter === 'community') {
    el.catList.innerHTML = '';
    el.musicList.classList.add('is-hidden');
    el.emptyState.classList.add('is-hidden');
    el.communitySection.classList.remove('is-hidden');
    if (el.addBtnEl) el.addBtnEl.classList.add('is-hidden');
    renderCommunityList();
    return;
  }

  // 「音楽だけ」モード
  if (state.filter === 'music') {
    el.catList.innerHTML = '';
    el.emptyState.classList.add('is-hidden');
    el.communitySection.classList.add('is-hidden');
    el.musicList.classList.remove('is-hidden');
    if (el.addBtnEl) el.addBtnEl.classList.add('is-hidden');
    renderMusicList();
    return;
  }

  // 通常モード（ねこ・お気に入り）
  el.musicList.classList.add('is-hidden');
  el.communitySection.classList.add('is-hidden');
  if (el.addBtnEl) el.addBtnEl.classList.remove('is-hidden');

  // フィルター適用
  const visibleCats = state.cats.filter((cat) => {
    if (state.filter === 'favorites') return cat.isFavorite;
    return true;
  });

  // 空っぽ表示の切り替え
  if (visibleCats.length === 0) {
    el.emptyState.classList.remove('is-hidden');
    el.catList.innerHTML = '';
    if (state.filter === 'favorites') {
      el.emptyState.querySelector('.empty-title').textContent =
        'お気に入りはまだありません';
      el.emptyState.querySelector('.empty-hint').innerHTML =
        '⭐マークをタップして<br />お気に入りに追加してください';
    } else {
      el.emptyState.querySelector('.empty-title').textContent =
        'まだ猫がいません';
      el.emptyState.querySelector('.empty-hint').innerHTML =
        '下の「＋ 猫を追加」ボタンから、<br />あなたの猫を登録してみてください';
    }
    return;
  }

  el.emptyState.classList.add('is-hidden');

  // カードを並べる（新しい順）
  const sortedCats = [...visibleCats].sort((a, b) => b.createdAt - a.createdAt);

  el.catList.innerHTML = sortedCats
    .map((cat) => renderCatCard(cat))
    .join('');

  // 各ボタンにクリック動作を設定
  bindCatCardEvents();
}

function renderCatCard(cat) {
  const isPlaying = state.currentlyPlayingId === cat.id;
  let photoHtml;
  if (cat.photoUrl) {
    photoHtml = `<img src="${cat.photoUrl}" alt="${escapeHtml(cat.name)}の写真" />`;
  } else if (cat.defaultImage) {
    photoHtml = `<img src="${cat.defaultImage}" alt="${escapeHtml(cat.name)}のイラスト" />`;
  } else {
    photoHtml = cat.defaultEmoji || '🐱';
  }

  // メタ情報：種類があれば種類を表示、無ければ登録日
  const metaText = cat.breed
    ? escapeHtml(cat.breed)
    : formatDate(cat.createdAt);

  return `
    <article class="cat-card ${isPlaying ? 'is-playing' : ''}" data-cat-id="${cat.id}">
      <button class="cat-photo cat-photo-btn" data-action="play" aria-label="${escapeHtml(cat.name)}の音を再生">
        ${photoHtml}
      </button>
      <div class="cat-info">
        <div class="cat-name">${escapeHtml(cat.name)}</div>
        <div class="cat-meta">${metaText}</div>
      </div>
      <div class="cat-actions">
        <button class="icon-btn fav-btn ${cat.isFavorite ? 'is-favorite' : ''}"
                data-action="favorite" aria-label="お気に入り">
          ${cat.isFavorite ? '⭐' : '☆'}
        </button>
        <button class="icon-btn share-btn" data-action="share" aria-label="共有">
          💌
        </button>
        <button class="icon-btn edit-btn" data-action="edit" aria-label="編集">
          ✏️
        </button>
        <button class="icon-btn delete-btn" data-action="delete" aria-label="削除">
          🗑️
        </button>
        <button class="icon-btn play-btn" data-action="play" aria-label="再生・停止">
          ${isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    </article>
  `;
}

function bindCatCardEvents() {
  el.catList.querySelectorAll('.cat-card').forEach((card) => {
    const catId = Number(card.dataset.catId);
    card.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'play') togglePlay(catId);
        else if (action === 'favorite') toggleFavorite(catId);
        else if (action === 'share') openShareMenu(catId);
        else if (action === 'edit') openEditModal(catId);
        else if (action === 'delete') confirmDeleteCat(catId);
      });
    });
  });
}

// ============================================
// 6. 再生・停止
// ============================================

function togglePlay(catId) {
  if (state.currentlyPlayingId === catId) {
    stopPlayback();
  } else {
    startPlayback(catId);
  }
}

function startPlayback(catId) {
  // 既に再生中なら止める
  stopPlayback();

  const cat = state.cats.find((c) => c.id === catId);
  if (!cat) return;

  // 古いURLがあれば解放
  if (state.currentObjectURL) {
    URL.revokeObjectURL(state.currentObjectURL);
    state.currentObjectURL = null;
  }

  // 音声URLを決める：Blobならその場で作る、Pathならそのまま
  let audioUrl;
  if (cat.audioBlob) {
    audioUrl = URL.createObjectURL(cat.audioBlob);
    state.currentObjectURL = audioUrl;
  } else if (cat.audioPath) {
    audioUrl = cat.audioPath;
  } else {
    alert('この猫には音が設定されていません 😿');
    return;
  }

  // <audio>要素を作って再生
  const audio = new Audio(audioUrl);
  audio.loop = true;             // 繰り返し再生
  audio.volume = state.volume;
  audio.playbackRate = cat.playbackRate || 1.0;   // 再生速度（個性）
  audio.play().catch((err) => {
    console.error('再生エラー:', err);
    alert('音声の再生に失敗しました 😿\n別のファイルで試してみてください。');
  });

  state.audioElement = audio;
  state.currentlyPlayingId = catId;

  // タイマーが設定されていたら開始
  startTimerIfNeeded();

  render();
}

function stopPlayback() {
  if (state.audioElement) {
    state.audioElement.pause();
    state.audioElement.src = '';
    state.audioElement = null;
  }
  if (state.currentObjectURL) {
    URL.revokeObjectURL(state.currentObjectURL);
    state.currentObjectURL = null;
  }
  state.currentlyPlayingId = null;
  musicPlayingIndex = null;
  communityPlayingId = null;
  stopTimer();
  render();
}

// ============================================
// 6.7 みんなの猫モード
// ============================================

// 起動時のステータス
let communityLoaded = false;
let communityLoading = false;

async function loadCommunityList() {
  if (communityLoading) return;
  communityLoading = true;
  el.communityStatus.textContent = '読み込み中...';
  try {
    const res = await fetch('/api/list');
    if (!res.ok) throw new Error('読み込みに失敗');
    const data = await res.json();
    communityCats = data.cats || [];
    communityLoaded = true;
    el.communityStatus.textContent = `${communityCats.length}匹の癒し音`;
    renderCommunityList();
  } catch (err) {
    el.communityStatus.textContent = '読み込みエラー：通信を確認してください';
    console.error('community load error:', err);
  } finally {
    communityLoading = false;
  }
}

function renderCommunityList() {
  if (!communityLoaded) {
    // 初回ロード
    loadCommunityList();
    return;
  }

  if (communityCats.length === 0) {
    el.communityList.innerHTML = `
      <div class="community-empty">
        <div class="empty-emoji">🐾</div>
        <p class="empty-title">まだ投稿がありません</p>
        <p class="empty-hint">あなたが最初の投稿者になってみませんか？<br>「📤 私の愛猫を投稿」ボタンから✨</p>
      </div>
    `;
    return;
  }

  el.communityList.innerHTML = communityCats.map((cat) => {
    const isPlaying = communityPlayingId === cat.id;
    const photoHtml = cat.hasPhoto
      ? `<img src="/api/photo/${escapeHtml(cat.id)}" alt="${escapeHtml(cat.name)}" loading="lazy" />`
      : '🐱';
    const breedHtml = cat.breed
      ? `<div class="cat-meta">${escapeHtml(cat.breed)}</div>`
      : '';
    return `
      <article class="cat-card ${isPlaying ? 'is-playing' : ''}" data-community-id="${escapeHtml(cat.id)}">
        <button class="cat-photo cat-photo-btn" data-community-action="play"
                aria-label="${escapeHtml(cat.name)}を再生">${photoHtml}</button>
        <div class="cat-info">
          <div class="cat-name">${escapeHtml(cat.name)}</div>
          ${breedHtml}
          ${cat.description ? `<div class="cat-meta" style="background:transparent;padding:2px 0;color:var(--color-text-soft);font-weight:400">${escapeHtml(cat.description)}</div>` : ''}
        </div>
        <div class="cat-actions">
          <button class="icon-btn play-btn" data-community-action="play" aria-label="再生・停止">
            ${isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </article>
    `;
  }).join('');

  // イベントバインド
  el.communityList.querySelectorAll('.cat-card').forEach((card) => {
    const id = card.dataset.communityId;
    card.querySelectorAll('[data-community-action]').forEach((btn) => {
      btn.addEventListener('click', () => togglePlayCommunity(id));
    });
  });
}

function togglePlayCommunity(id) {
  if (communityPlayingId === id) {
    stopPlayback();
  } else {
    startCommunityPlayback(id);
  }
}

function startCommunityPlayback(id) {
  stopPlayback();
  const audio = new Audio(`/api/audio/${id}`);
  audio.loop = true;
  audio.volume = state.volume;
  audio.play().catch((err) => {
    console.error('community play error:', err);
    alert('再生に失敗しました 😿');
  });
  state.audioElement = audio;
  communityPlayingId = id;
  startTimerIfNeeded();
  render();
}

// ============================================
// 6.8 投稿フォーム
// ============================================

function openUploadModal() {
  el.uploadForm.reset();
  el.uploadPhotoPreview.innerHTML = '<span class="photo-placeholder">🐱</span>';
  el.uploadAudioPreview.innerHTML = '<span class="audio-status">音声ファイルを選んでください</span>';
  el.uploadModal.hidden = false;
}

function closeUploadModal() {
  el.uploadModal.hidden = true;
}

async function submitUpload(e) {
  e.preventDefault();
  const name = el.uploadName.value.trim();
  const breed = el.uploadBreed.value.trim();
  const description = el.uploadDescription.value.trim();
  const email = el.uploadEmail.value.trim();
  const photoFile = el.uploadPhoto.files[0];
  const audioFile = el.uploadAudio.files[0];

  if (!name) { alert('猫の名前を入力してください'); return; }
  if (!audioFile) { alert('音声ファイルを選んでください'); return; }
  if (audioFile.size > 10 * 1024 * 1024) { alert('音声は10MB以下にしてください'); return; }
  if (photoFile && photoFile.size > 5 * 1024 * 1024) { alert('写真は5MB以下にしてください'); return; }

  el.uploadSubmitBtn.disabled = true;
  el.uploadSubmitBtn.textContent = '送信中...';

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('breed', breed);
    formData.append('description', description);
    formData.append('email', email);
    formData.append('audio', audioFile);
    if (photoFile) formData.append('photo', photoFile);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '投稿に失敗しました');

    alert(`✨ ${data.message}\n\n運営者の確認後、「みんなの猫」に表示されます🐾`);
    closeUploadModal();
  } catch (err) {
    alert(`投稿失敗: ${err.message || err}`);
  } finally {
    el.uploadSubmitBtn.disabled = false;
    el.uploadSubmitBtn.textContent = '📤 投稿する';
  }
}

// ============================================
// 6.5 音楽だけモード
// ============================================

function renderMusicList() {
  el.musicList.innerHTML = MUSIC_TRACKS.map((track, i) => {
    const isPlaying = musicPlayingIndex === i;
    return `
    <article class="cat-card ${isPlaying ? 'is-playing' : ''}" data-music-index="${i}">
      <button class="cat-photo cat-photo-btn" data-music-action="play"
              aria-label="${escapeHtml(track.name)}を再生">
        ${track.emoji}
      </button>
      <div class="cat-info">
        <div class="cat-name">${escapeHtml(track.name)}</div>
        <div class="cat-meta">${escapeHtml(track.desc)}</div>
      </div>
      <div class="cat-actions">
        <button class="icon-btn play-btn" data-music-action="play"
                aria-label="再生・停止">
          ${isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    </article>`;
  }).join('');

  el.musicList.querySelectorAll('.cat-card').forEach((card) => {
    const index = Number(card.dataset.musicIndex);
    card.querySelectorAll('[data-music-action]').forEach((btn) => {
      btn.addEventListener('click', () => togglePlayMusic(index));
    });
  });
}

function togglePlayMusic(index) {
  if (musicPlayingIndex === index) {
    stopPlayback();
  } else {
    startMusic(index);
  }
}

function startMusic(index) {
  stopPlayback();

  const track = MUSIC_TRACKS[index];
  if (!track) return;

  const audio = new Audio(track.path);
  audio.loop = true;
  audio.volume = state.volume;
  audio.play().catch((err) => {
    console.error('音楽の再生エラー:', err);
    alert('音楽の再生に失敗しました 😿');
  });

  state.audioElement = audio;
  musicPlayingIndex = index;

  startTimerIfNeeded();
  render();
}

// ============================================
// 7. タイマー
// ============================================

function startTimerIfNeeded() {
  if (state.timerSeconds <= 0) {
    el.timerRemaining.textContent = '';
    return;
  }
  state.timerEndsAt = Date.now() + state.timerSeconds * 1000;
  updateTimerDisplay();
  state.timerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.timerEndsAt = null;
  el.timerRemaining.textContent = '';
}

function updateTimerDisplay() {
  if (!state.timerEndsAt) return;
  const remainingMs = state.timerEndsAt - Date.now();

  if (remainingMs <= 0) {
    // タイマー終了 → 再生停止
    stopPlayback();
    return;
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  el.timerRemaining.textContent = `残り ${minutes}:${String(seconds).padStart(2, '0')}`;
}

// ============================================
// 8. お気に入り切り替え
// ============================================

async function toggleFavorite(catId) {
  const cat = state.cats.find((c) => c.id === catId);
  if (!cat) return;
  cat.isFavorite = !cat.isFavorite;
  await updateCat(cat);
  render();
}

// ============================================
// 9. 猫の追加・編集（モーダル）
// ============================================

function openAddModal() {
  editing.catId = null;
  editing.photoBlob = null;
  editing.audioBlob = null;
  editing.audioFileName = '';

  el.modalTitle.textContent = '猫を追加';
  el.catName.value = '';
  el.catBreed.value = '';
  el.catPhoto.value = '';
  el.catAudio.value = '';
  el.photoPreview.innerHTML = '<span class="photo-placeholder">🐱</span>';
  el.audioPreview.innerHTML = '<span class="audio-status">音声ファイルを選んでください</span>';
  el.catAudio.required = true;

  // 追加時は削除セクション非表示
  if (el.modalDeleteSection) el.modalDeleteSection.classList.add('is-hidden');

  el.modal.hidden = false;
}

function openEditModal(catId) {
  const cat = state.cats.find((c) => c.id === catId);
  if (!cat) return;

  editing.catId = catId;
  editing.photoBlob = cat.photoBlob || null;
  editing.audioBlob = cat.audioBlob || null;
  editing.audioFileName = cat.audioFileName || '';

  el.modalTitle.textContent = '猫を編集';
  el.catName.value = cat.name;
  el.catBreed.value = cat.breed || '';
  el.catPhoto.value = '';
  el.catAudio.value = '';

  if (cat.photoUrl) {
    el.photoPreview.innerHTML = `<img src="${cat.photoUrl}" alt="プレビュー" />`;
  } else if (cat.defaultImage) {
    el.photoPreview.innerHTML = `<img src="${cat.defaultImage}" alt="プレビュー" />`;
  } else if (cat.defaultEmoji) {
    el.photoPreview.innerHTML = `<span class="photo-placeholder">${cat.defaultEmoji}</span>`;
  } else {
    el.photoPreview.innerHTML = '<span class="photo-placeholder">🐱</span>';
  }

  if (cat.audioBlob || cat.audioPath) {
    el.audioPreview.innerHTML = `<span class="audio-status has-file">登録済みの音声（変更しない場合はそのまま）</span>`;
    el.catAudio.required = false;   // 編集時は変更しなくてOK
  } else {
    el.audioPreview.innerHTML = '<span class="audio-status">音声ファイルを選んでください</span>';
    el.catAudio.required = true;
  }

  // 編集時は削除セクションを表示
  if (el.modalDeleteSection) el.modalDeleteSection.classList.remove('is-hidden');

  el.modal.hidden = false;
}

function closeModal() {
  el.modal.hidden = true;
}

// 写真選択時のプレビュー
el.catPhoto.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  editing.photoBlob = file;
  const url = URL.createObjectURL(file);
  el.photoPreview.innerHTML = `<img src="${url}" alt="プレビュー" />`;
});

// 音声選択時のプレビュー
el.catAudio.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  editing.audioBlob = file;
  editing.audioFileName = file.name;
  el.audioPreview.innerHTML = `<span class="audio-status has-file">${escapeHtml(file.name)}</span>`;
});

// フォーム送信
el.catForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = el.catName.value.trim();
  const breed = el.catBreed.value.trim();
  if (!name) return;

  if (editing.catId === null) {
    // 新規追加：音声は必須
    if (!editing.audioBlob) {
      alert('音声ファイルを選んでください 🎵');
      return;
    }
    const newCat = {
      name,
      breed,
      photoBlob: editing.photoBlob,
      audioBlob: editing.audioBlob,
      audioFileName: editing.audioFileName,
      playbackRate: 1.0,
      isFavorite: false,
      createdAt: Date.now(),
    };
    await addCat(newCat);
  } else {
    // 編集：既存の値はそのまま、変更したものだけ上書き
    const cat = state.cats.find((c) => c.id === editing.catId);
    if (cat) {
      cat.name = name;
      cat.breed = breed;
      // 写真が新しく選ばれた時だけ更新（ファイルオブジェクトの場合）
      if (editing.photoBlob instanceof File || editing.photoBlob instanceof Blob) {
        cat.photoBlob = editing.photoBlob;
      }
      // 音声が新しく選ばれた時だけ更新
      if (editing.audioBlob instanceof File || editing.audioBlob instanceof Blob) {
        cat.audioBlob = editing.audioBlob;
        cat.audioFileName = editing.audioFileName;
        // ユーザーが音を差し替えたら、playbackRateは標準に戻す
        cat.playbackRate = 1.0;
      }
      await updateCat(cat);
    }
  }

  // 写真URLをメモリから一度解放してから読み直す
  cleanupCatUrls();
  await loadCats();
  closeModal();
  render();
});

// ============================================
// 10. 削除（確認付き）
// ============================================

function confirmDeleteCat(catId) {
  const cat = state.cats.find((c) => c.id === catId);
  if (!cat) return;
  el.confirmMessage.textContent = `「${cat.name}」を削除してもよろしいですか？`;
  pendingConfirm = async () => {
    if (state.currentlyPlayingId === catId) stopPlayback();
    await deleteCat(catId);
    cleanupCatUrls();
    await loadCats();
    render();
  };
  el.confirmDialog.hidden = false;
}

el.confirmYes.addEventListener('click', async () => {
  if (pendingConfirm) {
    const fn = pendingConfirm;
    pendingConfirm = null;
    el.confirmDialog.hidden = true;
    await fn();
  }
});

el.confirmNo.addEventListener('click', () => {
  pendingConfirm = null;
  el.confirmDialog.hidden = true;
});

// ============================================
// 11. 共有（ファイルダウンロード）
// ============================================

function openShareMenu(catId) {
  pendingShareCatId = catId;
  el.shareMenu.hidden = false;
}

function closeShareMenu() {
  pendingShareCatId = null;
  el.shareMenu.hidden = true;
}

el.downloadBtn.addEventListener('click', async () => {
  const cat = state.cats.find((c) => c.id === pendingShareCatId);
  if (!cat) return;

  // 音声データ（Blob）を取得：Blobならそのまま、Pathならfetchで取得
  let audioBlob;
  try {
    if (cat.audioBlob) {
      audioBlob = cat.audioBlob;
    } else if (cat.audioPath) {
      const response = await fetch(cat.audioPath);
      audioBlob = await response.blob();
    } else {
      alert('共有できる音声がありません 😿');
      return;
    }
  } catch (err) {
    console.error('音声の取得エラー:', err);
    alert('音声の取得に失敗しました 😿');
    return;
  }

  const fileName = makeShareFileName(cat);
  const file = new File([audioBlob], fileName, { type: audioBlob.type || 'audio/mpeg' });

  // Web Share API（スマホで友達アプリに直接送れる）が使えるか判定
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `${cat.name}のゴロゴロ音`,
        text: `${cat.name}の癒しの音をどうぞ🐾`,
      });
      closeShareMenu();
      return;
    } catch (err) {
      // ユーザーがキャンセル等 → 普通のダウンロードに進む
      if (err.name === 'AbortError') return;
    }
  }

  // 通常のダウンロード（パソコンや古いスマホ）
  const url = URL.createObjectURL(audioBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  closeShareMenu();
});

el.shareCloseBtn.addEventListener('click', closeShareMenu);
el.shareOverlay.addEventListener('click', closeShareMenu);

function makeShareFileName(cat) {
  const original = cat.audioFileName || '';
  const extMatch = original.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : '.mp3';
  const safeName = cat.name.replace(/[\\/:*?"<>|]/g, '_');
  return `${safeName}-ゴロゴロ${ext}`;
}

// ============================================
// 12. 音量・タイマーのイベント
// ============================================

el.volume.addEventListener('input', (e) => {
  const value = Number(e.target.value);
  state.volume = value / 100;
  el.volumeValue.textContent = `${value}%`;

  // スライダーの色を更新
  e.target.style.background = `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${value}%, var(--color-border) ${value}%, var(--color-border) 100%)`;

  // 再生中なら即反映
  if (state.audioElement) {
    state.audioElement.volume = state.volume;
  }

  // 設定を保存
  localStorage.setItem('volume', String(state.volume));
});

el.timer.addEventListener('change', (e) => {
  state.timerSeconds = Number(e.target.value);
  localStorage.setItem('timerSeconds', String(state.timerSeconds));

  // 再生中なら、すぐにタイマーを開始/停止
  if (state.audioElement) {
    stopTimer();
    startTimerIfNeeded();
  }
});

// ============================================
// 13. フィルター切り替え
// ============================================

el.filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    el.filterBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.filter = btn.dataset.filter;
    render();
  });
});

// ============================================
// 14. モーダルの開閉
// ============================================

el.addBtn.addEventListener('click', openAddModal);
el.cancelBtn.addEventListener('click', closeModal);
el.modalOverlay.addEventListener('click', closeModal);

// ============================================
// 15. ヘルパー関数
// ============================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日 登録`;
}

// 古い写真URLを解放（メモリの節約）
function cleanupCatUrls() {
  state.cats.forEach((cat) => {
    if (cat.photoUrl) {
      URL.revokeObjectURL(cat.photoUrl);
      cat.photoUrl = null;
    }
  });
}

// データベースから猫を読み込んで、写真URLを生成
async function loadCats() {
  const cats = await getAllCats();
  // 写真があれば表示用のURLを作っておく
  cats.forEach((cat) => {
    if (cat.photoBlob) {
      cat.photoUrl = URL.createObjectURL(cat.photoBlob);
    }
  });
  state.cats = cats;
}

// マイグレーション：古いデフォルト猫（今は削除済み）を取り除く
async function migrateRemoveOldDefaults() {
  if (REMOVED_DEFAULT_CAT_NAMES.length === 0) return;
  const allCats = await getAllCats();
  for (const cat of allCats) {
    if (cat.isDefault && REMOVED_DEFAULT_CAT_NAMES.includes(cat.name)) {
      // 再生中だったら停止
      if (state.currentlyPlayingId === cat.id) {
        stopPlayback();
      }
      await deleteCat(cat.id);
    }
  }
}

// 初回起動時：デフォルトの7匹を読み込む
async function initDefaultCats() {
  const isInitialized = localStorage.getItem('defaultsLoaded');
  if (isInitialized) return;

  const baseTime = Date.now();
  for (let i = 0; i < DEFAULT_CATS.length; i++) {
    const defaultCat = DEFAULT_CATS[i];
    // 1番目を最も新しく → リストの先頭に。後の番号ほど下に並ぶ
    const createdAt = baseTime - i;
    await addCat({
      name: defaultCat.name,
      breed: defaultCat.breed,
      defaultEmoji: defaultCat.defaultEmoji,
      defaultImage: defaultCat.defaultImage,
      audioPath: defaultCat.audioPath,
      audioFileName: defaultCat.audioFileName,
      playbackRate: defaultCat.playbackRate,
      photoBlob: null,
      audioBlob: null,
      isFavorite: false,
      isDefault: true,
      createdAt: createdAt,
    });
  }

  localStorage.setItem('defaultsLoaded', 'true');
}

// マイグレーション：既存ユーザーのデフォルト猫にdefaultImageを追加
async function migrateAddDefaultImages() {
  const allCats = await getAllCats();
  for (const cat of allCats) {
    if (cat.isDefault && !cat.defaultImage) {
      // 名前で対応するDEFAULT_CATSを探す
      const matched = DEFAULT_CATS.find((dc) => dc.name === cat.name);
      if (matched && matched.defaultImage) {
        cat.defaultImage = matched.defaultImage;
        await updateCat(cat);
      }
    }
  }
}

// デフォルトの猫をもう一度読み込む（リセット用）
async function reloadDefaultCats() {
  // 重複しないように：既に同じ名前のデフォルト猫があれば削除
  const existingDefaults = state.cats.filter((c) => c.isDefault);
  for (const cat of existingDefaults) {
    await deleteCat(cat.id);
  }
  localStorage.removeItem('defaultsLoaded');
  stopPlayback();
  await initDefaultCats();
  cleanupCatUrls();
  await loadCats();
  render();
}

// ============================================
// 17. バックアップ・復元（あなたの猫を永遠に）
// ============================================

// Blobをbase64文字列に変換
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // "data:audio/mpeg;base64,..." の "..." 部分だけを取り出す
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// base64文字列をBlobに戻す
function base64ToBlob(base64, type) {
  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

// あなたの猫をすべてバックアップファイルにする
async function exportUserCats() {
  // デフォルト以外の猫だけ（あなたが追加した猫）
  const userCats = state.cats.filter((c) => !c.isDefault);

  if (userCats.length === 0) {
    alert(
      'まだあなたの猫が追加されていません 🐱\n\n' +
      '「＋ 猫を追加」から愛猫を登録してから、もう一度試してください。'
    );
    return;
  }

  try {
    // 各猫のBlobをbase64に変換
    const exportData = await Promise.all(
      userCats.map(async (cat) => {
        const audioBase64 = cat.audioBlob ? await blobToBase64(cat.audioBlob) : null;
        const audioType = cat.audioBlob ? cat.audioBlob.type : null;
        const photoBase64 = cat.photoBlob ? await blobToBase64(cat.photoBlob) : null;
        const photoType = cat.photoBlob ? cat.photoBlob.type : null;

        return {
          name: cat.name,
          breed: cat.breed || '',
          audioBase64,
          audioType,
          audioFileName: cat.audioFileName || '',
          photoBase64,
          photoType,
          playbackRate: cat.playbackRate || 1.0,
          isFavorite: !!cat.isFavorite,
          createdAt: cat.createdAt || Date.now(),
        };
      })
    );

    const backupData = {
      app: 'neko-gorogoro',
      version: 1,
      exportedAt: new Date().toISOString(),
      catCount: exportData.length,
      cats: exportData,
    };

    const json = JSON.stringify(backupData);
    const blob = new Blob([json], { type: 'application/json' });

    // ファイル名（日付つき）
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `neko-gorogoro-backup-${dateStr}.json`;

    // ダウンロード
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    alert(
      `✅ ${userCats.length}匹のバックアップを保存しました！\n\n` +
      `ファイル名: ${fileName}\n\n` +
      `このファイルはUSBや別のフォルダ、メールの下書きなど、\n` +
      `安全な場所に大切に保管してくださいね💝\n\n` +
      `パソコンが壊れても、このファイルがあれば\n` +
      `猫たちを連れて引っ越せます🐾`
    );
  } catch (err) {
    console.error('Export error:', err);
    alert('❌ バックアップの作成に失敗しました 😿\n\nもう一度試してください。');
  }
}

// バックアップファイルから猫を復元
async function importUserCats(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // ファイルが正しいか確認
    if (!data.cats || !Array.isArray(data.cats)) {
      throw new Error('Invalid backup file format');
    }

    if (data.cats.length === 0) {
      alert('このバックアップファイルには猫が入っていませんでした 😿');
      return;
    }

    // 1匹ずつIndexedDBに復元
    let imported = 0;
    for (const catData of data.cats) {
      const audioBlob = catData.audioBase64
        ? base64ToBlob(catData.audioBase64, catData.audioType || 'audio/mpeg')
        : null;
      const photoBlob = catData.photoBase64
        ? base64ToBlob(catData.photoBase64, catData.photoType || 'image/jpeg')
        : null;

      await addCat({
        name: catData.name || '名前なし',
        breed: catData.breed || '',
        audioBlob,
        audioFileName: catData.audioFileName || '',
        photoBlob,
        playbackRate: catData.playbackRate || 1.0,
        isFavorite: !!catData.isFavorite,
        isDefault: false,
        createdAt: catData.createdAt || Date.now(),
      });
      imported++;
    }

    cleanupCatUrls();
    await loadCats();
    render();

    alert(
      `✅ ${imported}匹を復元しました！🐾\n\n` +
      `おかえりなさい💝`
    );
  } catch (err) {
    console.error('Import error:', err);
    alert(
      '❌ バックアップファイルの読み込みに失敗しました 😿\n\n' +
      '正しいバックアップファイル（.json）か確認してください。'
    );
  }
}

// ============================================
// 18. 永続ストレージ要求（ブラウザに「消さないで」とお願い）
// ============================================

async function requestPersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const result = await navigator.storage.persist();
        if (result) {
          console.log('✅ ブラウザがデータを永続的に保護してくれます');
        }
      }
    }
  } catch (err) {
    // ブラウザが対応していなくても続行（無視）
  }
}

// ============================================
// 19. ダークモード切替
// ============================================

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (el.themeToggle) el.themeToggle.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (el.themeToggle) el.themeToggle.textContent = '🌙';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

// ============================================
// 16. アプリ起動
// ============================================

async function init() {
  // ダークモード設定を最初に読み込む（チラつき防止）
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') applyTheme('dark');

  // ブラウザに「データを消さないで」とお願いする
  requestPersistentStorage();

  // 保存しておいた音量・タイマーを読み込む
  const savedVolume = localStorage.getItem('volume');
  if (savedVolume !== null) {
    state.volume = Number(savedVolume);
    el.volume.value = Math.round(state.volume * 100);
    el.volumeValue.textContent = `${el.volume.value}%`;
    el.volume.dispatchEvent(new Event('input'));
  } else {
    // 初期値を反映
    el.volume.dispatchEvent(new Event('input'));
  }

  const savedTimer = localStorage.getItem('timerSeconds');
  if (savedTimer !== null) {
    state.timerSeconds = Number(savedTimer);
    el.timer.value = String(state.timerSeconds);
  }

  // データベースを開いて、必要ならデフォルト猫を読み込み、猫を取得
  try {
    await openDB();
    await initDefaultCats();           // 初回だけ：7匹のデフォルト猫を登録
    await migrateRemoveOldDefaults();   // 古いデフォルト猫があれば削除（バージョン移行用）
    await migrateAddDefaultImages();    // 既存ユーザーにスケッチイラストを追加
    await loadCats();
    render();
  } catch (err) {
    console.error('データベースエラー:', err);
    alert('データの読み込みに失敗しました 😿\nブラウザを再起動してみてください。');
  }

  // リセットボタン（デフォルト8匹を復元）
  if (el.resetDefaultsBtn) {
    el.resetDefaultsBtn.addEventListener('click', () => {
      el.confirmMessage.textContent = '8匹のデフォルト猫を読み直しますか？\n（自分で追加した猫は残ります）';
      pendingConfirm = async () => {
        await reloadDefaultCats();
      };
      el.confirmDialog.hidden = false;
    });
  }

  // バックアップボタン
  if (el.backupBtn) {
    el.backupBtn.addEventListener('click', exportUserCats);
  }

  // 復元（ファイル選択）
  if (el.restoreInput) {
    el.restoreInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      el.confirmMessage.textContent = `${file.name}\n\nこのバックアップから猫を復元しますか？\n（既存の猫はそのままで、追加で復元します）`;
      pendingConfirm = async () => {
        await importUserCats(file);
        e.target.value = '';   // ファイル入力をリセット
      };
      el.confirmDialog.hidden = false;
    });
  }

  // ダークモード切替
  if (el.themeToggle) {
    el.themeToggle.addEventListener('click', toggleTheme);
  }

  // 編集モーダル内の削除ボタン
  if (el.modalDeleteBtn) {
    el.modalDeleteBtn.addEventListener('click', () => {
      const catId = editing.catId;
      if (catId === null) return;
      // モーダルを閉じてから削除確認
      closeModal();
      confirmDeleteCat(catId);
    });
  }

  // ===== みんなの猫 =====
  if (el.communityUploadBtn) {
    el.communityUploadBtn.addEventListener('click', openUploadModal);
  }
  if (el.communityRefreshBtn) {
    el.communityRefreshBtn.addEventListener('click', () => {
      communityLoaded = false;
      loadCommunityList();
    });
  }
  if (el.uploadCancelBtn) {
    el.uploadCancelBtn.addEventListener('click', closeUploadModal);
  }
  if (el.uploadModalOverlay) {
    el.uploadModalOverlay.addEventListener('click', closeUploadModal);
  }
  if (el.uploadForm) {
    el.uploadForm.addEventListener('submit', submitUpload);
  }
  if (el.uploadPhoto) {
    el.uploadPhoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      el.uploadPhotoPreview.innerHTML = `<img src="${url}" alt="プレビュー" />`;
    });
  }
  if (el.uploadAudio) {
    el.uploadAudio.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      el.uploadAudioPreview.innerHTML =
        `<span class="audio-status has-file">${escapeHtml(file.name)}</span>`;
    });
  }
}

// ページが開いた瞬間に起動
init();
