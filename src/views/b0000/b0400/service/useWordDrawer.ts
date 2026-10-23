import { computed, reactive } from 'vue'
import { apiLookupDict } from '@/api/b0400/b0400-api'
import { apiCreateWord } from '@/api/b0100/b0100-api'
import type { DictLookupResp } from '@/views/b0000/b0400/type/b0400-question-type'
import type { WordUpsertReq } from '../../b0100/type/b0100Type'
import { ElMessage } from 'element-plus'

function normTerm(raw: string): string {
  return (raw ?? '')
    .trim()
    .replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '')
    .toLowerCase()
}

function joinExamples(examples?: { en: string; zh: string }[]): string {
  return (examples ?? [])
    .map((x) => {
      const en = (x?.en ?? '').trim()
      const zh = (x?.zh ?? '').trim()
      if (!en && !zh) return ''
      if (en && zh) return `${en}\n${zh}`
      return en || zh
    })
    .filter(Boolean)
    .join('\n\n')
}

export function useWordDrawer() {
  const state = reactive({
    visible: false,
    loading: false,
    saving: false,
    term: '',
    dict: null as DictLookupResp | null,
    error: '' as string,

    draft: {
      pos: '',
      zh: '',
      example: '',
    },

    dictAvailable: true,
  })

  const canAdd = computed(() => {
    const term = (state.term ?? '').trim()
    const pos = (state.draft.pos ?? '').trim()
    const zh = (state.draft.zh ?? '').trim()
    return !!term && !!pos && !!zh
  })

  async function open(termRaw: string) {
    const term = normTerm(termRaw)
    if (!term) return

    state.visible = true
    state.loading = true
    state.error = ''
    state.term = term
    state.dict = null
    state.dictAvailable = true

    // 清空草稿
    state.draft.pos = ''
    state.draft.zh = ''
    state.draft.example = ''

    try {
      const d = await apiLookupDict(term)
      state.dict = d

      state.draft.pos = (d.pos ?? '').trim()
      state.draft.zh = (d.zh ?? '').trim()
      const exText = joinExamples(d.examples) // 使用上面新版 joinExamples（物件陣列）
      state.draft.example = exText.replace(/\\n/g, '\n') // 保險：處理 AI 回傳的字面 \n
    } catch {
      state.dictAvailable = false
      state.error = '字典服務尚未設定或查詢失敗：請手動填寫詞性/中文後加入單字庫。'
      state.dict = null
    } finally {
      state.loading = false
    }
  }

  function close() {
    state.visible = false
  }

  async function addToWordBank() {
    const englishWord = (state.term ?? '').trim()
    const partOfSpeech = (state.draft.pos ?? '').trim()
    const chineseMeaning = (state.draft.zh ?? '').trim()
    const note = (state.draft.example ?? '').trim()

    if (!englishWord || !partOfSpeech || !chineseMeaning) {
      const msg = '加入單字庫失敗：詞性與中文不可為空。'
      state.error = msg
      ElMessage.warning(msg) // ⚠️ 警告提示
      throw new Error(msg)
    }

    state.saving = true
    state.error = ''

    try {
      await apiCreateWord({
        englishWord,
        partOfSpeech,
        chineseMeaning,
        note,
      } satisfies WordUpsertReq)

      // ✅ 成功提示
      ElMessage.success('已成功加入單字庫')

      // （建議）成功後關閉 drawer 或清空狀態
      state.visible = false
      state.term = ''
      state.dict = null
    } catch (e) {
      const msg = '加入單字庫失敗，請稍後再試'
      state.error = msg

      // ❌ 錯誤提示
      ElMessage.error(msg)

      throw e
    } finally {
      state.saving = false
    }
  }

  return { state, open, close, addToWordBank, canAdd }
}
