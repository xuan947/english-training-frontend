// src/services/speech.ts

export type SpeechLang = 'en-US' | 'en-GB' | 'zh-TW' | string

export type SpeakOptions = {
  lang?: SpeechLang
  rate?: number
  slowRate?: number
  pitch?: number
  volume?: number
  cancelBeforeSpeak?: boolean
  /**
   * 是否啟用「第二次放慢」
   * 預設 false
   */
  slowOnRepeat?: boolean
  /**
   * 自訂記憶 key（預設用 text）
   * 例如：同一單字不同頁面也算同一次
   */
  memoryKey?: string
}

/** 是否支援 Web Speech API */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** 記錄播放次數 */
const speakCountMap = new Map<string, number>()

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!canSpeak()) return
  const t = (text ?? '').toString().trim()
  if (!t) return

  const {
    lang = 'en-US',
    rate = 1,
    slowRate = 0.8,
    pitch = 1,
    volume = 1,
    cancelBeforeSpeak = true,
    slowOnRepeat = false,
    memoryKey,
  } = options

  const key = memoryKey ?? `${lang}:${t}`
  const count = (speakCountMap.get(key) ?? 0) + 1
  speakCountMap.set(key, count)

  const finalRate = slowOnRepeat && count >= 2 ? slowRate : rate

  const ut = new SpeechSynthesisUtterance(t)
  ut.lang = lang
  ut.rate = finalRate
  ut.pitch = pitch
  ut.volume = volume

  if (cancelBeforeSpeak) window.speechSynthesis.cancel()
  window.speechSynthesis.speak(ut)
}

/** 清除某個文字的播放記憶 */
export function resetSpeakCount(key?: string) {
  if (!key) speakCountMap.clear()
  else speakCountMap.delete(key)
}

/** 停止播放 */
export function stopSpeak(): void {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
}
