<template>
  <el-card shadow="never">
    <template #header>
      <el-row justify="space-between" align="middle">
        <el-col>
          <h2 style="margin: 0">B0400 抽考</h2>
          <el-text type="info">MVP：本頁先用前端題庫資料，之後可改為呼叫後端出題</el-text>
        </el-col>
        <el-col>
          <el-button @click="backToList">回錯題庫</el-button>
        </el-col>
      </el-row>
    </template>

    <!-- Settings -->
    <el-form label-position="top" style="margin-bottom: 14px" v-if="phase === 'setup'">
      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="題數">
            <el-input-number
              v-model="cfg.count"
              :min="1"
              :max="Math.max(1, pool.length)"
              :step="1"
              :precision="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="只出星號">
            <el-select v-model="cfg.starredOnly" style="width: 100%">
              <el-option label="否" :value="false" />
              <el-option label="是" :value="true" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="題型">
            <el-select v-model="cfg.mode" style="width: 100%">
              <el-option label="自動（有選項就選擇題，否則簡答）" value="auto" />
              <el-option label="只做選擇題" value="mcq" />
              <el-option label="只做簡答" value="text" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6" style="display: flex; align-items: end; justify-content: flex-end">
          <el-button type="primary" :disabled="pool.length === 0" @click="startQuiz"
            >開始</el-button
          >
        </el-col>
      </el-row>

      <el-alert
        v-if="pool.length === 0"
        type="warning"
        :closable="false"
        title="目前題庫為空，請先回錯題庫新增題目。"
      />
    </el-form>

    <!-- Quiz -->
    <div v-else>
      <el-row justify="space-between" align="middle" style="margin-bottom: 10px">
        <el-col>
          <el-text>進度：{{ idx + 1 }} / {{ session.length }}</el-text>
          <span style="margin: 0 8px">|</span>
          <el-text type="info">重要：{{ q.isStarred ? '★' : '—' }}</el-text>
          <span style="margin: 0 8px">|</span>
          <el-text type="info">標籤：{{ (q.tags || []).join('、') || '-' }}</el-text>
        </el-col>

        <el-col style="display: flex; gap: 8px; justify-content: flex-end">
          <el-button @click="prev" :disabled="idx === 0">上一題</el-button>
          <el-button @click="next" :disabled="idx === session.length - 1">下一題</el-button>
          <el-button type="danger" @click="reset">結束</el-button>
        </el-col>
      </el-row>

      <el-card shadow="never" style="margin-bottom: 12px">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div style="font-weight: 700">{{ q.title || '（未命名）' }}</div>
            <div>
              <el-button text @click="toggleStar(q)">{{
                q.isStarred ? '取消星號' : '設為重要'
              }}</el-button>
            </div>
          </div>
        </template>
        <el-text>
          {{ q.promptText }}
        </el-text>
        <el-divider />

        <!-- Answer area -->
        <div v-if="isMcq(q)">
          <el-radio-group v-model="ans.key">
            <el-radio v-for="op in q.options" :key="op.key" :label="op.key">
              {{ op.key }}. {{ op.text }}
            </el-radio>
          </el-radio-group>
        </div>
        <div v-else>
          <el-input
            v-model="ans.text"
            type="textarea"
            :rows="3"
            placeholder="輸入你的答案（可留空，當作看答案複習）"
          />
        </div>

        <div style="margin-top: 12px; display: flex; gap: 8px">
          <el-button type="primary" :disabled="submitted" @click="submit">送出</el-button>
          <el-button :disabled="!submitted" @click="showExplain = !showExplain">
            {{ showExplain ? '收合解析' : '顯示解析/筆記' }}
          </el-button>
        </div>

        <!-- Result -->
        <div v-if="submitted" style="margin-top: 12px">
          <el-alert
            :type="isCorrect ? 'success' : 'error'"
            :closable="false"
            :title="isCorrect ? '答對' : '答錯（或尚未作答）'"
          />
        </div>

        <div v-if="submitted && showExplain" style="margin-top: 12px">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="正解">
              <div v-if="q.answerKey">選項：{{ q.answerKey }}</div>
              <div v-if="q.answerText" style="white-space: pre-wrap">{{ q.answerText }}</div>
              <div v-if="!q.answerKey && !q.answerText">（未設定正解）</div>
            </el-descriptions-item>

            <el-descriptions-item label="我的筆記">
              <div style="white-space: pre-wrap">{{ q.noteText || '-' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- Summary -->
      <el-card shadow="never">
        <template #header>本次作答紀錄（暫存）</template>
        <el-table :data="history" border size="small">
          <el-table-column label="題目" min-width="260">
            <template #default="{ row }">{{ row.title }}</template>
          </el-table-column>
          <el-table-column label="結果" width="120" align="center">
            <template #default="{ row }">{{ row.isCorrect ? '✅' : '❌' }}</template>
          </el-table-column>
          <el-table-column label="你的答案" min-width="180">
            <template #default="{ row }">{{ row.given }}</template>
          </el-table-column>
          <el-table-column label="正解" width="120" align="center">
            <template #default="{ row }">{{ row.answer }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiGetQuestions } from '@/api/b0400/b0400-api'
import type { ChoiceKey, QuestionOption } from '@/views/b0000/b0400/type/b0400-question-type'

type QuizQuestion = {
  id: number
  title?: string | null
  promptText?: string | null
  options?: QuestionOption[] | null
  answerKey?: ChoiceKey | '' | null
  answerText?: string | null
  noteText?: string | null
  isStarred: boolean
  tags?: string[]
}

const router = useRouter()
function backToList() {
  router.push({ name: 'B0400' })
}

const pool = ref<QuizQuestion[]>([])

// ===== Setup =====
const phase = ref<'setup' | 'quiz'>('setup')
const cfg = reactive({
  count: 5,
  starredOnly: false,
  mode: 'auto' as 'auto' | 'mcq' | 'text',
})

const session = ref<QuizQuestion[]>([])
const idx = ref(0)

// ===== Answer state =====
const ans = reactive({
  key: '' as '' | 'A' | 'B' | 'C' | 'D',
  text: '',
})

const submitted = ref(false)
const showExplain = ref(false)
const history = ref<
  { id: number; title: string; isCorrect: boolean; given: string; answer: string }[]
>([])

const q = computed(() => session.value[idx.value]!)
function isMcq(x: QuizQuestion) {
  if (cfg.mode === 'mcq') return true
  if (cfg.mode === 'text') return false
  return !!(x.options && x.options.length)
}

function startQuiz() {
  const base = cfg.starredOnly ? pool.value.filter((x) => x.isStarred) : pool.value.slice()
  const k = Math.min(Math.max(1, cfg.count), Math.max(1, base.length))

  // 簡單洗牌
  const shuffled = base.slice()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = tmp
  }

  session.value = shuffled.slice(0, k)
  idx.value = 0
  resetAnswer()
  history.value = []
  phase.value = 'quiz'
}

function reset() {
  phase.value = 'setup'
  session.value = []
  idx.value = 0
  resetAnswer()
  history.value = []
}

function resetAnswer() {
  ans.key = ''
  ans.text = ''
  submitted.value = false
  showExplain.value = false
}

const isCorrect = computed(() => {
  if (!submitted.value) return false
  const cur = q.value
  if (isMcq(cur)) {
    const given = ans.key
    const correct = (cur.answerKey ?? '') as unknown
    return !!given && !!correct && given === correct
  } else {
    // MVP：簡答先做「trim 後完全比對」，之後你可改成更寬鬆（或 AI 判分）
    const given = (ans.text ?? '').trim()
    const correct = (cur.answerText ?? '').trim()
    if (!given || !correct) return false
    return given === correct
  }
})

function submit() {
  if (submitted.value) return
  submitted.value = true
  showExplain.value = true

  const cur = q.value
  const given = isMcq(cur) ? ans.key : (ans.text ?? '').trim()
  const answer = cur.answerKey ? cur.answerKey : (cur.answerText ?? '')
  history.value.push({
    id: cur.id,
    title: cur.title || `#${cur.id}`,
    isCorrect: isCorrect.value,
    given: given || '（未作答）',
    answer: answer || '（未設定）',
  })

  // TODO（接後端時）：POST /b0400/question-attempts
  // 送出：question_id, given_answer, is_correct, time_spent...
}

function next() {
  if (idx.value >= session.value.length - 1) return
  idx.value++
  resetAnswer()
}

function prev() {
  if (idx.value <= 0) return
  idx.value--
  resetAnswer()
}

function toggleStar(x: QuizQuestion) {
  x.isStarred = !x.isStarred
  // TODO: 後端 PUT /b0400/questions/{id} 更新 isStarred
}

function oneLine(s?: string | null): string {
  return (s ?? '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function loadPool() {
  try {
    const data = await apiGetQuestions()

    pool.value = data.map((x) => ({
      id: x.id,
      title: x.title ?? '',
      promptText: oneLine(x.promptText),
      options: x.options && x.options.length ? x.options : null,
      answerKey: x.answerKey ?? '',
      answerText: oneLine(x.answerText),
      noteText: oneLine(x.noteText),
      isStarred: !!x.isStarred,
      tags: x.tags ?? [],
    }))
  } catch (e) {
    console.error('loadPool failed', e)
    pool.value = []
  }
}

onMounted(() => {
  loadPool()
})
</script>
