// src/views/b0000/b0400/service/parseQuestionOnClient.ts
import { http } from '@/api/http'

export type OptionKey = 'A' | 'B' | 'C' | 'D'
export type ParseOption = { key: OptionKey; text: string }

/**
 * AI 解析後的標準結構（與 editor UI 對齊）
 */
export type ParseQuestionResp = {
  type: 'mcq'
  title: string
  promptText: string
  options: ParseOption[]
  answerKey: '' | OptionKey
  answerText: string
  tags: string[]
  confidence: 0 | 1 | 2 | 3 | 4 | 5
  warnings: string[]
  raw: {
    hasImageOnly: boolean
    detectedOptionCount: number
    detectedAnswerInImage: boolean
  }
}

type ParseQuestionReq = {
  imageDataUrl: string
}

/**
 * 壓縮設定（你可以依需求調整）
 */
export type CompressOptions = {
  /** 目標最大寬度（保持比例縮放） */
  maxWidth?: number
  /** jpeg 壓縮品質 0~1 */
  quality?: number
  /** 輸出格式：建議 jpeg，通常會比 png 小很多 */
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png'
  /** 原圖若已經小於 maxWidth，是否仍強制重編碼（通常不用） */
  forceReencode?: boolean
}

/**
 * ✅ 改成打你自己的 Spring：/api/ai/parse-question
 * 圖片仍然是 dataURL，但會先在前端縮圖/壓縮後再送出（大幅降延遲）
 */
export async function parseQuestionOnClient(
  imageDataUrl: string,
  compress: CompressOptions = {},
): Promise<ParseQuestionResp> {
  if (!imageDataUrl.startsWith('data:image')) {
    throw new Error('parseQuestionOnClient: invalid image data')
  }

  // 1) 前端先縮圖/壓縮（加速關鍵）
  const optimized = await compressImageDataUrl(imageDataUrl, {
    maxWidth: compress.maxWidth ?? 1100,
    quality: compress.quality ?? 0.78,
    mimeType: compress.mimeType ?? 'image/jpeg',
    forceReencode: compress.forceReencode ?? false,
  })

  // 2) 呼叫後端
  const res = await http.post<ParseQuestionResp>(
    '/api/ai/parse-question',
    { imageDataUrl: optimized } satisfies ParseQuestionReq,
    {
      // 你也可以在這裡加前端 timeout（axios）
      // timeout: 30_000,
    },
  )

  // 3) 保險正規化（避免後端/模型偶發缺 A-D）
  const out = res.data
  out.options = normalizeOptions(out.options)
  return out
}

/**
 * 保證選項一定有 A-D
 */
function normalizeOptions(input: ParseOption[]): ParseOption[] {
  const map = new Map<OptionKey, string>()
  for (const o of input ?? []) {
    map.set(o.key, o.text ?? '')
  }
  return (['A', 'B', 'C', 'D'] as const).map((k) => ({
    key: k,
    text: map.get(k) ?? '',
  }))
}

/**
 * 把 dataURL 圖片縮小並壓縮成較小的 dataURL（通常 jpg 會大幅變小）
 */
async function compressImageDataUrl(
  dataUrl: string,
  opt: Required<CompressOptions>,
): Promise<string> {
  // 解析原始 mime（可用於判斷）
  const srcMime = getDataUrlMimeType(dataUrl)

  // 載入圖片
  const img = await loadImage(dataUrl)

  // 計算縮放比例
  const needScale = img.width > opt.maxWidth
  const scale = needScale ? opt.maxWidth / img.width : 1
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  // 若不需要縮放，也不強制重編碼，就直接回傳原圖（省 CPU）
  if (!needScale && !opt.forceReencode) {
    return dataUrl
  }

  // canvas 縮放 + 重新編碼
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl

  // 一點點清晰度優化（可選）
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(img, 0, 0, w, h)

  // 若原圖是 png 但你要 jpeg：通常會變小很多（截圖文字大多仍可讀）
  // quality 對 png 無效（png 是無損）
  const out = canvas.toDataURL(opt.mimeType, opt.mimeType === 'image/png' ? undefined : opt.quality)

  // 保底：若重編碼反而變更大，就回傳原圖（避免變慢）
  // （dataURL 長度可視為大小 proxy）
  if (out.length >= dataUrl.length && srcMime === opt.mimeType) {
    return dataUrl
  }
  return out
}

function getDataUrlMimeType(dataUrl: string): string {
  // data:image/png;base64,...
  const m = /^data:([^;]+);base64,/.exec(dataUrl)
  return m?.[1] ?? ''
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
