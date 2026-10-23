export type WrongWordRow = {
  wordId: number
  en: string
  pos: string | null
  zh: string
  correctCount: number
  wrongCount: number
  lastAskedAt: string // 後端回 ISO 字串
}
