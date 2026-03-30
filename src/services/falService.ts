/**
 * Fal.ai IDM-VTON Service
 * バーチャル試着の画像生成
 */

const PROXY_BASE = '/api/proxy';

export type Resolution = '1K' | '2K' | '4K';
export type ImageFormat = 'png' | 'jpeg' | 'webp';

const RESOLUTION_MAP: Record<Resolution, number> = {
  '1K': 1024,
  '2K': 2048,
  '4K': 4096,
};

interface TryOnRequest {
  humanImageUrl: string;
  garmentImageUrl: string;
  description?: string;
  resolution?: Resolution;
  format?: ImageFormat;
}

interface TryOnResult {
  imageUrl: string;
  maskUrl?: string;
}

/**
 * Fal.ai にリクエストを送信
 */
async function falRequest(path: string, method: string = 'GET', body?: any): Promise<any> {
  const params = new URLSearchParams({ path });
  if (path.startsWith('fal-ai/') && method === 'POST') {
    // Initial submit goes to queue.fal.run
  }

  const url = `${PROXY_BASE}?${params.toString()}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.detail || errorData.error || `API Error: ${response.status}`);
  }
  return response.json();
}

/**
 * ステータスをポーリング
 */
async function pollStatus(requestId: string, endpoint: string): Promise<any> {
  const statusPath = `fal-ai/${endpoint}/requests/${requestId}/status`;
  const maxAttempts = 120; // 最大2分

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const status = await falRequest(statusPath);
      console.log(`[Fal.ai] Status: ${status.status}`);

      if (status.status === 'COMPLETED') {
        // 結果を取得
        const resultPath = `fal-ai/${endpoint}/requests/${requestId}`;
        return await falRequest(resultPath);
      }

      if (status.status === 'FAILED') {
        throw new Error(`Generation failed: ${status.error || 'Unknown'}`);
      }
    } catch (e: any) {
      if (e.message.includes('Generation failed')) throw e;
      console.warn(`[Fal.ai] Poll error, retrying...`, e.message);
    }
  }

  throw new Error('Generation timed out');
}

/**
 * バーチャル試着を実行
 */
export async function generateTryOn(request: TryOnRequest): Promise<TryOnResult> {
  console.log('[TryOn] Starting generation...');

  // 解像度を取得
  const size = request.resolution ? RESOLUTION_MAP[request.resolution] : 1024;
  const format = request.format || 'png';

  // Submit to queue
  const submitResult = await falRequest('fal-ai/idm-vton', 'POST', {
    human_image_url: request.humanImageUrl,
    garment_image_url: request.garmentImageUrl,
    description: request.description || 'a garment',
    width: size,
    height: size,
    output_format: format,
  });

  // If we got a direct result (synchronous)
  if (submitResult.image) {
    return {
      imageUrl: submitResult.image.url,
      maskUrl: submitResult.mask?.url,
    };
  }

  // If queued, poll for result
  if (submitResult.request_id) {
    console.log(`[TryOn] Queued: ${submitResult.request_id}`);
    const result = await pollStatus(submitResult.request_id, 'idm-vton');
    return {
      imageUrl: result.image?.url || result.images?.[0]?.url,
      maskUrl: result.mask?.url,
    };
  }

  throw new Error('Unexpected response format');
}

/**
 * ローカルの File を data URL に変換
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
