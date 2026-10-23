<template>
  <el-card shadow="never">
    <template #header>
      <el-row justify="space-between" align="middle">
        <el-col>
          <h2>B0400 錯題庫</h2>
        </el-col>
      </el-row>
      <el-row justify="space-between" align="middle">
        <el-col>
          <el-button type="primary" @click="goNew">新增錯題</el-button>
          <el-button @click="goQuiz" :disabled="filtered.length === 0">抽考</el-button>
        </el-col>
      </el-row>
    </template>

    <!-- Filters -->
    <el-row :gutter="12" style="margin-bottom: 12px">
      <el-col :span="8">
        <el-input v-model="keyword" placeholder="搜尋（題幹/筆記/標籤）" clearable />
      </el-col>

      <el-col :span="6">
        <el-select v-model="starFilter" style="width: 100%">
          <el-option label="全部" value="all" />
          <el-option label="只看星號" value="starred" />
        </el-select>
      </el-col>

      <el-col :span="6">
        <el-select v-model="sortBy" style="width: 100%">
          <el-option label="最後測驗時間（新→舊）" value="lastAskedDesc" />
          <el-option label="錯誤次數（多→少）" value="wrongDesc" />
          <el-option label="更新時間（新→舊）" value="updatedDesc" />
        </el-select>
      </el-col>

      <el-col :span="4" style="display: flex; justify-content: flex-end; align-items: center">
        <el-button :loading="loading" @click="reload">重新整理</el-button>
      </el-col>
    </el-row>

    <!-- List -->
    <el-table :data="paged" border stripe style="width: 100%">
      <el-table-column label="重要" width="80" align="center">
        <template #default="{ row }">
          <el-button text @click="toggleStar(row)" style="font-size: 22px; line-height: 1">
            {{ row.isStarred ? '★' : '☆' }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="題目" min-width="420">
        <template #default="{ row }">
          <div style="display: flex; flex-direction: column; gap: 6px">
            <div style="font-weight: 600">
              {{ row.title || '（未命名）' }}
            </div>

            <!-- 題幹可點字 -->
            <question-renderer
              v-if="row.promptText"
              :text="row.promptText"
              @word-click="openWord"
            />
            <el-text v-else type="info">（此題無題幹文字，可能只有圖片）</el-text>
            <template v-if="row.options?.length">
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px">
                <el-text type="info">選擇題（{{ row.options.length }} 選項）</el-text>
                <el-button size="small" text @click="toggleExpand(row.id)">
                  {{ expanded.has(row.id) ? '收合' : '顯示選項' }}
                </el-button>
              </div>

              <el-collapse-transition>
                <div v-show="expanded.has(row.id)" style="margin-top: 8px">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px">
                    <div
                      v-for="op in row.options"
                      :key="op.key"
                      style="display: flex; gap: 8px; align-items: center"
                    >
                      <!-- A / B / C / D -->
                      <el-tag
                        size="small"
                        effect="plain"
                        :type="op.key === row.answerKey ? 'danger' : 'info'"
                      >
                        {{ op.key }}
                      </el-tag>

                      <!-- 選項文字 -->
                      <el-text :type="op.key === row.answerKey ? 'danger' : undefined">
                        {{ op.text }}
                      </el-text>
                    </div>
                  </div>
                </div>
              </el-collapse-transition>
            </template>

            <div v-if="row.tags?.length" style="display: flex; flex-wrap: wrap; gap: 6px">
              <el-tag v-for="t in row.tags" :key="t" size="small">{{ t }}</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="統計" width="220">
        <template #default="{ row }">
          <div style="display: flex; flex-direction: column; gap: 4px">
            <el-text>錯：{{ row.wrongCount ?? 0 }}　對：{{ row.correctCount ?? 0 }}</el-text>
            <el-text type="info">最後測驗：{{ row.lastAskedAt || '-' }}</el-text>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="220" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="goEdit(row.id)">編輯</el-button>
          <el-button size="small" type="danger" @click="remove(row.id)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div style="display: flex; justify-content: center; margin-top: 12px">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="filtered.length"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
      />
    </div>
  </el-card>

  <!-- Word Drawer -->
  <word-drawer
    v-model:visible="wd.state.visible"
    :loading="wd.state.loading"
    :saving="wd.state.saving"
    :term="wd.state.term"
    :dict="wd.state.dict"
    :error="wd.state.error"
    :can-add="wd.canAdd.value"
    :dict-available="wd.state.dictAvailable"
    :draft="wd.state.draft"
    @add="handleAddWord"
    modal-class="word-dialog-mask"
    append-to-body
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import QuestionRenderer from '@/views/b0000/b0400/components/question-renderer.vue'
import WordDrawer from '@/views/b0000/b0400/components/word-drawer.vue'
import { useWordDrawer } from '@/views/b0000/b0400/service/useWordDrawer'
import type { QuestionItem } from '@/views/b0000/b0400/type/b0400-question-type'
import { apiGetQuestions } from '@/api/b0400/b0400-api'

type UiQuestion = QuestionItem & {
  wrongCount?: number
  correctCount?: number
  lastAskedAt?: string | null
}

// ===== Router =====
const router = useRouter()
function goNew() {
  router.push({ name: 'b0400_new' })
}
function goEdit(id: number) {
  router.push({ name: 'b0400_edit', params: { id } })
}
function goQuiz() {
  router.push({ name: 'b0400_quiz' })
}

// ===== Word Drawer =====
const wd = useWordDrawer()
function openWord(w: string) {
  wd.open(w)
}

async function handleAddWord() {
  try {
    await wd.addToWordBank()
  } catch {
    // error 已顯示於 drawer
  }
}

// ===== Filters / paging =====
const loading = ref(false)
const keyword = ref('')
const starFilter = ref<'all' | 'starred'>('all')
const sortBy = ref<'lastAskedDesc' | 'wrongDesc' | 'updatedDesc'>('lastAskedDesc')
const page = ref(1)
const pageSize = ref(10)
const rows = ref<UiQuestion[]>([])

function oneLine(s?: string | null): string {
  return (s ?? '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function reload() {
  loading.value = true
  try {
    const data = await apiGetQuestions()

    // 後端目前沒有提供的欄位，先補 UI 預設（避免畫面壞）
    rows.value = data.map((x) => ({
      ...x,
      isStarred: false, // TODO: 之後接後端欄位
      chapters: [], // TODO
      wrongCount: 0,
      correctCount: 0,
      lastAskedAt: null,
      title: x.title ?? undefined,
      promptText: oneLine(x.promptText) ?? undefined,
      answerText: x.answerText ?? undefined,
      noteText: x.noteText ?? undefined,
    }))
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = rows.value.slice()

  if (starFilter.value === 'starred') {
    list = list.filter((x) => !!x.isStarred)
  }
  if (kw) {
    list = list.filter((x) => {
      const blob = [
        x.title,
        x.promptText,
        x.noteText,
        (x.tags || []).join(' '),
        (x.chapters || []).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return blob.includes(kw)
    })
  }

  // sort
  if (sortBy.value === 'wrongDesc') {
    list.sort((a, b) => (b.wrongCount ?? 0) - (a.wrongCount ?? 0))
  } else {
    // lastAskedDesc
    list.sort((a, b) => (b.lastAskedAt || '').localeCompare(a.lastAskedAt || ''))
  }

  return list
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function toggleStar(row: UiQuestion) {
  row.isStarred = !row.isStarred
  // TODO: 後端 PUT /questions/{id} 更新 isStarred
}

function remove(id: number) {
  rows.value = rows.value.filter((x) => x.id !== id)
  // TODO: 後端 DELETE /questions/{id}
}

const expanded = ref(new Set<number>())

function toggleExpand(id: number) {
  const s = expanded.value
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expanded.value = new Set(s) // 觸發更新
}

onMounted(() => {
  reload()
})
</script>
<style scoped>
/* ===== 遮罩（背景黑藍） ===== */
:global(.word-dialog-mask) {
  background-color: rgba(15, 23, 42, 0.55) !important;
}

/* ===== Drawer 面板本體 ===== */
:global(.word-dialog-mask .el-drawer) {
  --el-drawer-bg-color: #0f172a;
  background-color: #0f172a !important;
  color: #e5e7eb; /* 字色偏淺灰 */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

/* ===== Header / Body / Footer 全部不透明 ===== */
:global(.word-dialog-mask .el-drawer__header),
:global(.word-dialog-mask .el-drawer__body),
:global(.word-dialog-mask .el-drawer__footer) {
  background-color: #0f172a !important;
}

/* ===== Header 分隔線 ===== */
:global(.word-dialog-mask .el-drawer__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* ===== 標題文字 ===== */
:global(.word-dialog-mask .el-drawer__title) {
  color: #f8fafc;
  font-weight: 600;
}
</style>
