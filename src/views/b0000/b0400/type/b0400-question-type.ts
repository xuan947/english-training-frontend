export type QuestionAsset = {
  id: number
  assetType: 'PROMPT_IMAGE' | 'ANSWER_IMAGE'
  url: string
}
export type ChoiceKey = 'A' | 'B' | 'C' | 'D'
export type QuestionOption = { key: 'A' | 'B' | 'C' | 'D' | string; text: string }

export type QuestionItem = {
  id: number
  title?: string | null
  promptText?: string | null
  answerText?: string | null
  options: QuestionOption[]
  noteText?: string | null
  isStarred: boolean
  tags?: string[]
  chapters?: string[]
  assets?: QuestionAsset[]
  updatedAt?: string | null
  answerKey?: ChoiceKey | '' | null // 允許空字串或 null
}

export type DictExample = { en: string; zh: string }

export type DictLookupResp = {
  term: string
  ipa: string
  pos: string
  zh: string
  examples: DictExample[]
  source: string
}
