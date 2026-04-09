/**
 * ChatGPT Service - OpenAI API を使った服の説明生成
 * 画像分析にはGPT-4o (vision対応) を使用
 */

declare const process: { env: { OPENAI_API_KEY?: string } };
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatGPTResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

/**
 * ChatGPT API を呼び出し（テキストのみ）
 */
async function callChatGPT(systemPrompt: string, userPrompt: string, imageBase64?: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured. Please add it to .env');

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (imageBase64) {
    // Vision対応: 画像付きメッセージ
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64, // data:image/... 形式
            detail: 'low',
          },
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: userPrompt });
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ChatGPT API Error: ${response.status} - ${err}`);
  }

  const data: ChatGPTResponse = await response.json();

  if (data.error) {
    throw new Error(`ChatGPT Error: ${data.error.message}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty ChatGPT response');
  return text.trim();
}

/**
 * 服の画像から英語の説明を生成（ChatGPT Vision）
 */
export async function describeGarment(garmentImageBase64: string, userHint?: string): Promise<string> {
  const systemPrompt = `You are a professional fashion analyst. Your task is to analyze garment images and provide precise, detailed English descriptions optimized for AI virtual try-on models. Be concise but thorough.`;

  const userPrompt = `Analyze this garment image and provide a detailed English description in 2-3 sentences.

${userHint ? `User's hint: "${userHint}"` : ''}

Focus on:
- Garment type (shirt, jacket, dress, pants, etc.)
- Color, pattern, and material
- Style, fit, and silhouette
- Notable details (buttons, zippers, logos, prints, pockets, etc.)

Return ONLY the description, no other text.`;

  return callChatGPT(systemPrompt, userPrompt, garmentImageBase64);
}

/**
 * ユーザーの日本語入力を英語プロンプトに最適化
 */
export async function optimizeDescription(userDescription: string): Promise<string> {
  const systemPrompt = `You are a fashion prompt engineer. Translate and optimize garment descriptions for AI virtual try-on models.`;

  const userPrompt = `Translate and optimize this Japanese garment description into a concise, detailed English description suitable for an AI virtual try-on model. Keep it to 2-3 sentences.

Japanese input: "${userDescription}"

Return ONLY the English description.`;

  return callChatGPT(systemPrompt, userPrompt);
}
