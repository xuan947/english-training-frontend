import { ref, computed } from 'vue'
import type { WordItem, WordUpsertReq } from '@/views/b0000/b0100/type/b0100Type'
import {
  apiFetchWords,
  apiUploadExcel,
  apiCreateWord,
  apiUpdateWord,
  apiDeleteWord,
} from '@/api/b0100/b0100-api'

const bank = ref<WordItem[]>([])

/**
 * 查詢（唯一會更新 bank 的地方）
 */
async function fetchBank() {
  bank.value = await apiFetchWords()
  return bank.value
}

/**
 * Excel 匯入（不自動刷新畫面）
 */
async function uploadExcel(file: File) {
  return apiUploadExcel(file)
}

/**
 * 新增單筆資料
 */
async function createOne(req: WordUpsertReq) {
  const payload = normalizeUpsertReq(req)
  return apiCreateWord(payload)
}

/**
 * 更新單筆資料
 */
async function updateOne(wordId: number, req: WordUpsertReq) {
  const payload = normalizeUpsertReq(req)
  return apiUpdateWord(wordId, payload)
}

/**
 * 刪除單筆資料
 */
async function deleteOne(wordId: number) {
  return apiDeleteWord(wordId)
}

/** 只處理「熟悉度邏輯」，不管 UI */
async function setMemorized(WordItem: WordItem, memorizedLevel: number) {
  const payload = normalizeUpsertReq({
    englishWord: WordItem.englishWord,
    partOfSpeech: WordItem.partOfSpeech,
    chineseMeaning: WordItem.chineseMeaning,
    note: WordItem.note ?? null,
    memorizedLevel,
    examPassCount: WordItem.examPassCount,
  })

  return apiUpdateWord(WordItem.wordId, payload)
}

/**
 * 資料正規化（純 business logic）
 */
function normalizeUpsertReq(req: WordUpsertReq): WordUpsertReq {
  return {
    englishWord: req.englishWord.trim(),
    partOfSpeech: req.partOfSpeech.trim(),
    chineseMeaning: req.chineseMeaning.trim(),
    memorizedLevel: req.memorizedLevel,
    examPassCount: req.examPassCount,
    note: req.note?.trim() || null,
  }
}

const bankSize = computed(() => bank.value.length)

export function useWordBank() {
  return {
    bank,
    bankSize,
    fetchBank,
    uploadExcel,
    createOne,
    updateOne,
    deleteOne,
    setMemorized,
  }
}
