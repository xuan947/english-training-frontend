import { http } from '@/api/http'
import type { DictLookupResp, QuestionItem } from '@/views/b0000/b0400/type/b0400-question-type'

/** ====== Create Question ====== */
export type OptionKey = 'A' | 'B' | 'C' | 'D'
export type CreateOption = { key: OptionKey; text: string }

export type CreateQuestionReq = {
  title: string
  promptText: string
  options: CreateOption[]
  answerKey: '' | OptionKey
  answerText: string
  tags: string[]
  noteText: string
}

export type CreateQuestionResp = {
  id: number
  // 你後端如果回更多欄位（createdAt...）可再補
}

export async function apiCreateQuestion(payload: CreateQuestionReq): Promise<CreateQuestionResp> {
  const res = await http.post<CreateQuestionResp>('/api/b0400/questions', payload)
  return res.data
}

export async function apiGetQuestions(): Promise<QuestionItem[]> {
  const res = await http.get<QuestionItem[]>('/api/b0400/questions')
  return res.data ?? []
}

/** ====== Dict Lookup ====== */
export async function apiLookupDict(term: string): Promise<DictLookupResp> {
  const t = (term ?? '').trim()

  if (!t) {
    return {
      term: '',
      ipa: '',
      pos: '',
      zh: '',
      examples: [],
      source: 'local',
    }
  }

  const res = await http.get<DictLookupResp>('/api/b0400/dict/lookup', { params: { term: t } })

  return res.data
}
