import { http } from '@/api/http'
import type { QuizSessionSubmitReq, WordPick } from '@/views/b0000/b0200/type/b0200-quiz-type'

/**
 * 提交測驗結果
 *
 * @returns QuizSessionSubmitReq 表單內容
 * @author xuanli
 * @since 2025-12-17
 */
export async function submitQuizSession(req: QuizSessionSubmitReq) {
  const { data } = await http.post('/b0200/quiz/session/submit', req)
  return data
}


/**
 * 單字測驗可抽取題庫
 *
 * @returns WordPick 單字題庫
 * @author xuanli
 * @since 2025-12-17
 */
export function getPickPool() {
  return http.get<WordPick[]>('/b0200/quiz/pickPool')
}
