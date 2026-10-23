<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <el-row justify="space-between" align="middle">
          <el-col>
            <h2 style="margin: 0">錯題本</h2>
            <el-text type="info">只顯示「曾經答錯過」的單字，並依最後測驗時間排序</el-text>
          </el-col>
          <el-col>
            <el-button :loading="loading" @click="loadWrongWords">重新整理</el-button>
          </el-col>
        </el-row>
      </template>

      <el-row :gutter="12" style="margin-bottom: 12px">
        <el-col :span="8">
          <el-input v-model="keyword" placeholder="搜尋（英文 / 中文 / 詞性）" clearable />
        </el-col>
        <el-col :span="8">
          <el-select v-model="sortBy" style="width: 100%">
            <el-option label="最後測驗時間（新 → 舊）" value="lastDesc" />
            <el-option label="答錯次數（多 → 少）" value="wrongDesc" />
            <el-option label="答對次數（多 → 少）" value="correctDesc" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-switch v-model="onlyHighWrong" active-text="只看錯很多（≥3）" />
        </el-col>
      </el-row>

      <el-table
        :data="viewRows"
        border
        style="width: 100%"
      >
        <el-table-column label="#" width="60" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>

        <el-table-column label="英文" min-width="180">
          <template #default="{ row }">
            <el-text tag="b">{{ row.en }}</el-text>
            <el-button
              size="small"
              type="primary"
              plain
              @click.stop="speak(row.en)"
              :disabled="!canSpeak"
            >
              發音
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="詞性" width="100" align="center">
          <template #default="{ row }">
            <el-text type="info">{{ row.pos || '—' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="中文" min-width="220">
          <template #default="{ row }">
            {{ row.zh }}
          </template>
        </el-table-column>

        <el-table-column label="答對" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="success" effect="plain">{{ row.correctCount }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="答錯" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="danger" effect="plain">{{ row.wrongCount }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="最後測驗" width="170" align="center">
          <template #default="{ row }">
            <el-text type="info">{{ fmtDate(row.lastAskedAt) }}</el-text>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWrongBook } from '@/views/b0000/b0300/service/b0300-wrongbook-svc'
import type { WrongWordRow } from '@/views/b0000/b0300/type/b0300-wrongbook-type'
import { canSpeak, speak as speakSvc } from '@/services/speech'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'B0300WrongBookView' })

const { loading, rows, loadWrongWords } = useWrongBook()

const keyword = ref('')
const sortBy = ref<'lastDesc' | 'wrongDesc' | 'correctDesc'>('lastDesc')
const onlyHighWrong = ref(false)

const viewRows = computed<WrongWordRow[]>(() => {
  const kw = keyword.value.trim().toLowerCase()

  let list = rows.value.slice()

  if (kw) {
    list = list.filter((r) => {
      const en = (r.en ?? '').toLowerCase()
      const zh = (r.zh ?? '').toLowerCase()
      const pos = (r.pos ?? '').toLowerCase()
      return en.includes(kw) || zh.includes(kw) || pos.includes(kw)
    })
  }

  if (onlyHighWrong.value) {
    list = list.filter((r) => Number(r.wrongCount) >= 3)
  }

  list.sort((a, b) => {
    if (sortBy.value === 'wrongDesc') return Number(b.wrongCount) - Number(a.wrongCount)
    if (sortBy.value === 'correctDesc') return Number(b.correctCount) - Number(a.correctCount)
    // lastDesc
    return new Date(b.lastAskedAt).getTime() - new Date(a.lastAskedAt).getTime()
  })

  return list
})

function fmtDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 語音播放 */
function speak(text: string) {
  if (!canSpeak()) {
    ElMessage.warning('此瀏覽器不支援語音播放')
    return
  }
  speakSvc(text, {
    lang: 'en-US',
    rate: 1,
    slowRate: 0.8,
    slowOnRepeat: true,
  })
}
onMounted(loadWrongWords)
</script>
