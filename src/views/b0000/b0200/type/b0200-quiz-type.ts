export type QuizItem = {
  wordId: number
  en: string
  pos: string
  zh: string
  enAlts: string[]
  zhAlts: string[]
  memorizedLevel: number
  examPassCount: number
  wrongCount: number
  weight: number
}

export type QDir = 'en2zh' | 'zh2en'

export type RoundQ = {
  id: string
  item: QuizItem
  dir: QDir
  ask: string
  answer: string
  userAns: string
  ok: boolean | null
}

export type QuizSessionSubmitReq = {
  items: Array<{
    wordId: number
    isCorrect: boolean
    userAnswer?: string
  }>
}

export type WordPick = {
  wordId: number
  en: string
  pos: string
  zh: string
  memorizedLevel: number
  examPassCount: number
  correctCount: number
  wrongCount: number
  lastAskedAt: string | null
  weight: number
}

