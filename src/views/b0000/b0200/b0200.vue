<template>
  <div>
    <!-- Settings -->
    <el-card shadow="never">
      <el-form label-position="top">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="每次抽題數">
              <el-input-number
                v-model="count"
                :min="1"
                :max="eligibleSize || 1"
                :step="1"
                :precision="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="顯示詞性">
              <el-select v-model="showPos" style="width: 100%">
                <el-option label="顯示" value="yes" />
                <el-option label="不顯示" value="no" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="發音">
              <el-select v-model="accent" style="width: 100%">
                <el-option label="美式（en-US）" value="en-US" />
                <el-option label="英式（en-GB）" value="en-GB" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="出題模式">
              <el-select v-model="mode" style="width: 100%">
                <el-option label="中英交錯（隨機）" value="mix" />
                <el-option label="全英文題目（英→中）" value="en2zh" />
                <el-option label="全中文題目（中→英）" value="zh2en" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-space>
          <el-button
            v-if="!quizVisible"
            type="primary"
            :disabled="pool.length === 0"
            @click="startQuiz"
          >
            開始抽考
          </el-button>

          <el-button
            v-else-if="!roundChecked"
            type="primary"
            :disabled="roundQuestions.length === 0"
            @click="onCheckAndSubmit"
          >
            驗證本輪
          </el-button>

          <el-button
            v-else
            type="primary"
            :disabled="roundQuestions.length === 0"
            @click="restartQuiz"
          >
            抽下一輪
          </el-button>
        </el-space>

        <div style="margin-top: 12px">
          <el-space wrap>
            <el-tag effect="plain"
              >題庫：<b>{{ pool.length }}</b></el-tag
            >
            <el-tag type="success" effect="plain"
              >答對：<b>{{ stats.correct }}</b></el-tag
            >
            <el-tag type="danger" effect="plain"
              >答錯：<b>{{ stats.wrong }}</b></el-tag
            >
          </el-space>
        </div>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card v-if="quizVisible" shadow="never">
      <el-text type="info">本輪共 {{ roundQuestions.length }} 題（中英文隨機交錯）</el-text>

      <div style="margin-top: 12px">
        <el-table :data="roundQuestions" border style="width: 100%">
          <el-table-column label="#" width="60" align="center">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>

          <el-table-column label="題目" min-width="220">
            <template #default="{ row }">
              <el-space>
                <el-text tag="b">{{ row.ask }}</el-text>
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click.stop="speak(row.item.en)"
                  :disabled="!canSpeak"
                >
                  發音
                </el-button>
              </el-space>
              <div v-if="showPos === 'yes' && row.item.pos" style="margin-top: 6px">
                <el-text type="info">詞性：{{ row.item.pos }}</el-text>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="你的答案" min-width="220">
            <template #default="{ row, $index }">
              <el-autocomplete
                v-model="row.userAns"
                :fetch-suggestions="fetchSuggestionsForRow(row)"
                :trigger-on-focus="false"
                clearable
                placeholder="輸入答案"
                :disabled="roundChecked"
                @keydown.enter.prevent="handleEnterBatch($index)"
              />
            </template>
          </el-table-column>

          <el-table-column label="正確答案" min-width="220">
            <template #default="{ row }">
              <el-text v-if="roundChecked">{{ row.answer }}</el-text>
              <el-text v-else type="info">—</el-text>
            </template>
          </el-table-column>

          <el-table-column label="結果" width="90" align="center">
            <template #default="{ row }">
              <template v-if="roundChecked">
                <el-tag v-if="row.ok" type="success">✓</el-tag>
                <el-tag v-else type="danger">✗</el-tag>
              </template>
              <el-text v-else type="info">—</el-text>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-alert
        v-if="roundChecked"
        style="margin-top: 12px"
        type="success"
        show-icon
        :closable="false"
        :title="`本輪結果：答對 ${stats.correct}、答錯 ${stats.wrong}`"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { QuizItem, WordPick } from '@/views/b0000/b0200/type/b0200-quiz-type'
import { usePickPool, useQuiz } from '@/views/b0000/b0200/service/b0200-quiz-svc'
import { canSpeak, speak as speakSvc } from '@/services/speech'

defineOptions({ name: 'B0200View' })
const { pool, fetchPickPool, eligibleSize } = usePickPool()

/** 將後端資料轉成抽考用格式 */
const quizSource = computed<QuizItem[]>(() =>
  pool.value.map((w: WordPick) => ({
    wordId: w.wordId,
    en: w.en ?? '',
    pos: w.pos ?? '',
    zh: w.zh ?? '',
    enAlts: splitAlts(w.en),
    zhAlts: splitAlts(w.zh),

    memorizedLevel: Number(w.memorizedLevel ?? 0),
    examPassCount: Number(w.examPassCount ?? 0),

    wrongCount: Number(w.wrongCount ?? 0),
    weight: Number(w.weight ?? 1),
  })),
)

/**
 * 抽考狀態與動作（已抽到 composable）
 * 注意：accent/showPos/count/quizVisible/roundQuestions... 都從這裡來
 */
const {
  roundQuestions,
  roundChecked,
  quizVisible,
  count,
  showPos,
  accent,
  stats,
  startQuiz,
  restartQuiz,
  checkBatch,
  handleEnterBatch,
  submitRound,
  mode,
  fetchSuggestionsForRow,
} = useQuiz(() => quizSource.value)

async function onCheckAndSubmit() {
  checkBatch()
  await submitRound()
  ElMessage.success('已送出本輪結果')
}

/** 語音播放 */
function speak(text: string) {
  if (!canSpeak()) {
    ElMessage.warning('此瀏覽器不支援語音播放')
    return
  }
  speakSvc(text, {
    lang: accent.value,
    rate: 1,
    slowRate: 0.8,
    slowOnRepeat: true,
  })
}

function splitAlts(v: unknown): string[] {
  return String(v ?? '')
    .split(/[\/;|]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

onMounted(async () => {
  await fetchPickPool()
})
</script>
