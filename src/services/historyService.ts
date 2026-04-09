/**
 * History Service - localStorage ベースの生成履歴管理
 */


export interface HistoryEntry {
  id: string;
  imageUrl: string;       // base64 or blob URL → base64で保存
  timestamp: string;      // ISO string
  description?: string;
  resolution: string;
  format: string;
  garmentLabels: string[];
  modelPreviewThumb?: string;  // モデル画像のサムネイル(base64)
  garmentPreviewThumb?: string; // ガーメント画像のサムネイル(base64)
  generationTimeMs?: number; // 生成にかかった時間(ms)
}

const STORAGE_KEY = 'kiga_history';
const MAX_ENTRIES = 50;

/**
 * 全履歴を取得
 */
export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return parsed;
  } catch {
    console.warn('[History] Failed to parse history');
    return [];
  }
}

/**
 * 履歴に追加（先頭に追加、MAX_ENTRIES を超えたら古いものを削除）
 */
export function addToHistory(entry: HistoryEntry): void {
  try {
    const history = getHistory();
    history.unshift(entry);
    // 上限を超えた分を削除
    if (history.length > MAX_ENTRIES) {
      history.splice(MAX_ENTRIES);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('[History] Failed to save:', e);
  }
}

/**
 * 特定の履歴を削除
 */
export function removeFromHistory(id: string): void {
  try {
    const history = getHistory().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('[History] Failed to remove:', e);
  }
}

/**
 * 全履歴をクリア
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 画像URLからBase64に変換（外部URLをローカル保存するため）
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  // 既にbase64の場合はそのまま
  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url; // フォールバック
  }
}

/**
 * サムネイル生成（画像を小さくリサイズしてbase64で返す）
 */
export function generateThumbnail(file: File, maxSize: number = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject('No canvas context'); return; }

    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * ログインなしでDB保存するための匿名デバイスIDを取得
 */
export function getDeviceId(): string {
  const DEVICE_KEY = 'kiga_anonymous_device_id';
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = 'ano-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}
