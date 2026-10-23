import { http } from '@/api/http'
import type { WordItem, WordUpsertReq } from '@/views/b0000/b0100/type/b0100Type'

/**
 * 取得所有單字資料
 *
 * @returns WordItem[] 單字清單
 * @author xuanli
 * @since 2025-12-17
 */
export async function apiFetchWords(): Promise<WordItem[]> {
  const res = await http.get<WordItem[]>('/b0100/words')
  return res.data
}

/**
 * 上傳 Excel 檔案並由後端解析匯入單字
 *
 * @param file Excel 檔案（.xlsx / .xls）
 * @returns void
 * @author xuanli
 * @since 2025-12-17
 */
export async function apiUploadExcel(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)

  await http.post('/b0100/words/importExcel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 新增單筆單字
 *
 * @param payload 新增單字請求資料（已由呼叫端完成 trim / 正規化）
 * @returns WordItem 新增後的單字資料（後端回傳）
 * @author xuanli
 * @since 2025-12-17
 */
export async function apiCreateWord(payload: WordUpsertReq): Promise<WordItem> {
  const res = await http.post<WordItem>('/b0100/words', payload)
  return res.data
}

/**
 * 更新單筆單字
 *
 * @param wordId 單字主鍵 ID
 * @param payload 更新單字請求資料（已由呼叫端完成 trim / 正規化）
 * @returns WordItem 更新後的單字資料（後端回傳）
 * @author xuanli
 * @since 2025-12-17
 */
export async function apiUpdateWord(wordId: number, payload: WordUpsertReq): Promise<WordItem> {
  const res = await http.put<WordItem>(`/b0100/words/${wordId}`, payload)
  return res.data
}

/**
 * 刪除單筆單字
 *
 * @param wordId 單字主鍵 ID
 * @returns void
 * @author xuanli
 * @since 2025-12-17
 */
export async function apiDeleteWord(wordId: number): Promise<void> {
  await http.delete(`/b0100/words/${wordId}`)
}
