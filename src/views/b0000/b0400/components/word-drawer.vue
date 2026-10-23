<template>
  <el-drawer v-model="visibleModel" title="單字" size="440px">
    <div v-loading="loading" element-loading-background="rgba(15, 23, 42, 0.35)">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center">
        <div>
          <div style="font-size: 22px; font-weight: 700">{{ term }}</div>
          <el-text v-if="dict?.ipa" type="info">{{ dict.ipa }}</el-text>
        </div>

        <div style="display: flex; gap: 8px">
          <el-button @click="speakTerm" :disabled="!term">發音</el-button>
          <el-button type="primary" :loading="saving" :disabled="!canAdd" @click="emit('add')">
            加入單字庫
          </el-button>
        </div>
      </div>

      <el-divider />

      <el-alert
        v-if="error"
        type="warning"
        :closable="false"
        :title="error"
        style="margin-bottom: 12px"
      />

      <!-- Editable：只有在字典不可用/失敗時才顯示 -->
      <el-form v-if="!dictAvailable || !dict" label-position="top">
        <el-form-item label="詞性（必填）" required>
          <el-input
            :model-value="draft.pos"
            @update:model-value="(v: string) => updateDraft({ pos: v })"
            placeholder="n. / v. / adj."
          />
        </el-form-item>

        <el-form-item label="中文（必填）" required>
          <el-input
            :model-value="draft.zh"
            @update:model-value="(v: string) => updateDraft({ zh: v })"
          />
        </el-form-item>

        <el-form-item label="例句 / 備註">
          <el-input
            type="textarea"
            :rows="3"
            :model-value="draft.example"
            @update:model-value="(v: string) => updateDraft({ example: v })"
          />
        </el-form-item>
      </el-form>

      <!-- AI Dictionary -->
      <el-descriptions v-if="dictAvailable && dict" :column="1" border style="margin-top: 12px">
        <el-descriptions-item label="中文意思">
          <span v-if="dict.zh">{{ dict.zh }}</span>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="例句">
          <ul v-if="dict.examples?.length">
            <li v-for="(ex, i) in dict.examples" :key="i">
              <div>{{ ex.en }}</div>
              <el-text type="info">{{ ex.zh }}</el-text>
            </li>
          </ul>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DictLookupResp } from '@/views/b0000/b0400/type/b0400-question-type'

type Draft = { pos: string; zh: string; example: string }

const props = defineProps<{
  visible: boolean
  loading: boolean
  saving: boolean
  term: string
  dict: DictLookupResp | null
  error: string
  canAdd: boolean
  dictAvailable: boolean
  draft: Draft
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:draft', v: Draft): void
  (e: 'add'): void
}>()

const visibleModel = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

function updateDraft(patch: Partial<Draft>) {
  emit('update:draft', { ...props.draft, ...patch })
}

function speakTerm() {
  if (!props.term) return
  const u = new SpeechSynthesisUtterance(props.term)
  u.lang = 'en-US'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
</script>
<style lang="css" scoped>
/* 遮罩：只作用在這個 dialog */
:global(.word-dialog-mask) {
  background-color: rgba(15, 23, 42, 0.55) !important; /* 不會太黑 */
}

/* Dialog 面板：只作用在這個 dialog（完全不透明） */
:global(.word-dialog-mask .el-dialog) {
  --el-dialog-bg-color: #0f172a; /* Element Plus 會用到的變數 */
  background-color: #0f172a !important; /* 保險 */
  backdrop-filter: none !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

/* header/body/footer 都強制不透明 */
:global(.word-dialog-mask .el-dialog__header),
:global(.word-dialog-mask .el-dialog__body),
:global(.word-dialog-mask .el-dialog__footer) {
  background-color: #0f172a !important;
}

/* header 分隔線 */
:global(.word-dialog-mask .el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
