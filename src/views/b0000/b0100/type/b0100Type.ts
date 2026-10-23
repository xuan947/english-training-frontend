export type WordItem = {
  wordId: number
  englishWord: string
  partOfSpeech: string
  chineseMeaning: string
  note: string
  examPassCount: number
  memorizedLevel: number
  examStatusLabel?: string | null
  memorizedLevelLabel?: string | null
  updatedAt?: string | null
}

export type WordUpsertReq = {
  englishWord: string
  partOfSpeech: string
  chineseMeaning: string
  note?: string | null
  memorizedLevel?: number
  examPassCount?: number
}
