import { http } from '@/api/http'

/**
 * 查詢錯題本
 *
 * @returns WrongWordRow 錯題本
 * @author xuanli
 * @since 2025-12-17
 */
export async function fetchWrongWords() {
  const { data } = await http.get('/b0200/quiz/words/wrong')
  return data
}
