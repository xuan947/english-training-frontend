import { computed, nextTick, reactive, ref, watch } from 'vue'
import type {
  QDir,
  QuizItem,
  QuizSessionSubmitReq,
  RoundQ,
  WordPick,
} from '@/views/b0000/b0200/type/b0200-quiz-type'
import { submitQuizSession, getPickPool } from '@/api/b0200/b0200-api'

/** utils：字串標準化，用於比對答案 */
const norm = (s: unknown) => (s ?? '').toString().trim().replace(/\s+/g, ' ').toLowerCase()

/** utils：洗牌 */
/** utils：依權重不重複抽樣（without replacement） */
function weightedPick<T>(items: T[], k: number, weightOf: (x: T) => number): T[] {
  const pool = items.slice()
  const out: T[] = []
  const n = Math.min(k, pool.length)

  for (let t = 0; t < n; t++) {
    let total = 0
    const weights = pool.map((x) => {
      const w = Math.max(0, Number(weightOf(x)) || 0)
      total += w
      return w
    })

    // 如果全部權重都 0，就退化成均勻抽
    if (total <= 0) {
      const idx = Math.floor(Math.random() * pool.length)
      out.push(pool.splice(idx, 1)[0]!)
      continue
    }

    let r = Math.random() * total
    let idx = 0
    for (; idx < pool.length; idx++) {
      r -= weights[idx]!
      if (r <= 0) break
    }

    out.push(pool.splice(Math.min(idx, pool.length - 1), 1)[0]!)
  }

  return out
}

// ========================
// Pick Pool (同檔案內)
// ========================
const pool = ref<WordPick[]>([])
const poolLoading = ref(false)

async function fetchPickPool() {
  poolLoading.value = true
  try {
    const { data } = await getPickPool()
    pool.value = Array.isArray(data) ? data : []
  } finally {
    poolLoading.value = false
  }
}

const poolSize = computed(() => pool.value.length)
const eligibleSize = computed(() => pool.value.filter((x) => (x.memorizedLevel ?? 0) >= 1).length)

export function usePickPool() {
  return {
    pool,
    poolSize,
    eligibleSize,
    poolLoading,
    fetchPickPool,
  }
}

/**
 * 抽考 composable
 *
 * @param source 回傳「可抽考的題目來源」(已轉換成 QuizItem[])
 */
export function useQuiz(source: () => QuizItem[]) {
  /** 本輪題目 */
  const roundQuestions = ref<RoundQ[]>([])
  /** 本輪是否已驗證 */
  const roundChecked = ref(false)
  /** 是否顯示抽考區塊 */
  const quizVisible = ref(false)

  const mode = ref<'mix' | 'en2zh' | 'zh2en'>('mix')

  /** Settings */
  const count = ref(10)
  const showPos = ref<'yes' | 'no'>('yes')
  const accent = ref<'en-US' | 'en-GB'>('en-US')

  /** 統計（本輪） */
  const stats = reactive({ correct: 0, wrong: 0 })

  /** 題庫大小（來源長度） */
  const sourceSize = computed(() => source().length)

  /**
   * 抽一輪題目（中英方向隨機）
   * - 會重置 roundChecked / stats / userAns
   */
  function pickRound() {
    const src = source()

    // 只抽「唸過的」
    const eligible = src.filter((x) => (x.memorizedLevel ?? 0) >= 1)

    if (eligible.length === 0) {
      roundQuestions.value = []
      roundChecked.value = false
      stats.correct = 0
      stats.wrong = 0
      return
    }

    const n = Math.min(count.value, eligible.length)
    const picked = weightedPick(eligible, n, (it) => it.weight)

    roundQuestions.value = picked.map((it, i) => {
      const dir: QDir =
        mode.value === 'mix' ? (Math.random() < 0.5 ? 'en2zh' : 'zh2en') : mode.value
      return {
        id: `${Date.now()}_${i}`,
        item: it,
        dir,
        ask: dir === 'en2zh' ? it.en : it.zh,
        answer: dir === 'en2zh' ? it.zh : it.en,
        userAns: '',
        ok: null,
      }
    })

    roundChecked.value = false
    stats.correct = 0
    stats.wrong = 0
  }

  /** 開始抽考（若題庫有資料） */
  function startQuiz() {
    if (sourceSize.value === 0) return
    pickRound()
    quizVisible.value = true
  }

  /** 抽下一輪（保持顯示，不重置設定） */
  function restartQuiz() {
    if (sourceSize.value === 0) return
    pickRound()
  }

  /** 驗證本輪答案 */
  function checkBatch() {
    let c = 0
    let w = 0

    for (const q of roundQuestions.value) {
      const ua = norm(q.userAns)
      const candidates = q.dir === 'en2zh' ? q.item.zhAlts : q.item.enAlts
      const ok = candidates.map(norm).includes(ua)
      q.ok = ok
      ok ? c++ : w++
    }

    stats.correct = c
    stats.wrong = w
    roundChecked.value = true
  }

  /**
   * Enter 行為：
   * - 若不是最後一題：focus 到下一個 input
   * - 若是最後一題：直接驗證本輪
   */
  function handleEnterBatch(index: number) {
    if (roundChecked.value) return

    nextTick(() => {
      // 注意：這是依賴 Element Plus table 的 DOM 結構
      const inputs = document.querySelectorAll<HTMLInputElement>('.el-table__body input')
      inputs[index + 1]?.focus()
    })
  }

  /** 送出本輪結果到後端（需先 checkBatch） */
  async function submitRound() {
    if (!roundChecked.value) {
      checkBatch()
    }

    const payload: QuizSessionSubmitReq = {
      items: roundQuestions.value.map((q) => ({
        wordId: q.item.wordId,
        isCorrect: Boolean(q.ok),
        userAnswer: q.userAns?.trim() || undefined,
      })),
    }

    return await submitQuizSession(payload)
  }

  // ========= Autocomplete（不使用本題正解） =========
  type AcItem = { value: string }

  /** 從整個題庫建立字典（去重） */
  const dictEn = computed(() => {
    const set = new Set<string>()
    for (const it of source()) {
      const v = String(it.en ?? '').trim()
      if (v) set.add(v)
    }
    return Array.from(set)
  })

  const dictZh = computed(() => {
    const set = new Set<string>()
    for (const it of source()) {
      const v = String(it.zh ?? '').trim()
      if (v) set.add(v)
    }
    return Array.from(set)
  })

  /**
   * 每列一個 fetch-suggestions
   * - 英→中：你要輸入中文 → 用全題庫中文 dictZh 當候選
   * - 中→英：你要輸入英文 → 用全題庫英文 dictEn 當候選
   */
  function fetchSuggestionsForRow(row: RoundQ) {
    return (query: string, cb: (results: AcItem[]) => void) => {
      const q = norm(query)
      const candidates = row.dir === 'en2zh' ? dictZh.value : dictEn.value

      const filtered = candidates
        .filter((x) => norm(x).includes(q))
        .slice(0, 20)
        .map((x) => ({ value: x }))

      cb(filtered)
    }
  }

  /**
   * 保護 count 合法範圍：
   * - 至少 1
   * - 至多題庫大小（若題庫為 0，max 仍視為 1，避免 el-input-number 報錯）
   */
  const eligibleSize = computed(() => source().filter((x) => (x.memorizedLevel ?? 0) >= 1).length)

  watch(
    () => [count.value, eligibleSize.value] as const,
    () => {
      const max = Math.max(1, eligibleSize.value)
      const n = Number(count.value)
      const safe = Number.isFinite(n) ? n : 10
      count.value = Math.min(Math.max(1, Math.trunc(safe)), max)
    },
    { immediate: true },
  )

  return {
    // state
    roundQuestions,
    roundChecked,
    quizVisible,
    count,
    showPos,
    accent,
    mode,
    stats,
    sourceSize,

    // actions
    pickRound,
    startQuiz,
    restartQuiz,
    checkBatch,
    handleEnterBatch,
    submitRound,
    fetchSuggestionsForRow,
  }
}
