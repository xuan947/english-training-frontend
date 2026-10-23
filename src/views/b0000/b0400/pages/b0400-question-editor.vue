<template>
  <el-card shadow="never">
    <template #header>
      <el-row justify="space-between" align="middle">
        <el-col>
          <h2 style="margin: 0">新增錯題（截圖解析）</h2>
          <el-text type="info">上傳截圖 → AI 解析 → 檢查差異 → 套用到表單</el-text>
        </el-col>
        <el-col style="display: flex; gap: 8px; justify-content: flex-end">
          <el-button @click="resetAll" :disabled="busy">清空</el-button>
          <el-button type="primary" @click="save" :disabled="busy || !canSave">儲存</el-button>
        </el-col>
      </el-row>
    </template>

    <el-row :gutter="12">
      <!-- Left: Image -->
      <el-col :span="10">
        <el-card shadow="never" style="height: 100%">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div style="font-weight: 600">題目截圖</div>
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                accept=".png,.jpg,.jpeg"
                :disabled="busy"
                @change="onPick"
              >
                <el-button type="primary" plain :disabled="busy">選擇圖片</el-button>
              </el-upload>
            </div>
          </template>

          <div
            @dragenter.prevent
            @dragover.prevent
            @drop.prevent="onDrop"
            style="
              border: 1px dashed var(--el-border-color);
              border-radius: 10px;
              padding: 10px;
              min-height: 520px;
            "
          >
            <el-text type="info">支援 Ctrl+V 貼上，或把圖片拖曳到此區</el-text>

            <div
              v-if="imageUrl"
              style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px"
            >
              <el-image
                :src="imageUrl"
                fit="contain"
                style="width: 100%; height: 420px; border-radius: 8px"
              />
              <div style="display: flex; gap: 8px">
                <el-button
                  type="primary"
                  @click="parse"
                  :loading="parsing"
                  :disabled="!imageUrl || busy"
                >
                  解析
                </el-button>
                <el-button @click="applyAll" :disabled="!parsed || busy">全部套用</el-button>
                <el-button @click="undoApply" :disabled="!lastSnapshot || busy"
                  >復原上一次套用</el-button
                >
              </div>

              <el-alert
                v-if="parsed"
                :type="
                  parsed.confidence >= 4 ? 'success' : parsed.confidence >= 2 ? 'warning' : 'error'
                "
                :closable="false"
                style="margin-top: 6px"
              >
                <template #title>
                  解析信心：{{ parsed.confidence }}/5
                  <span v-if="parsed.warnings?.length"
                    >（{{ parsed.warnings.length }} 個提醒）</span
                  >
                </template>
                <div v-if="parsed.warnings?.length" style="margin-top: 6px">
                  <ul style="margin: 0; padding-left: 18px">
                    <li v-for="(w, i) in parsed.warnings" :key="i">{{ w }}</li>
                  </ul>
                </div>
              </el-alert>
            </div>

            <el-empty v-else description="請先上傳題目截圖（也可 Ctrl+V 或拖曳）" />
          </div>
        </el-card>
      </el-col>

      <!-- Right: Form + Diff -->
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div style="font-weight: 600">題目內容</div>
              <div style="display: flex; gap: 8px; align-items: center">
                <el-tag v-if="parsed" effect="plain">已解析</el-tag>
                <el-tag v-if="changedCount > 0" type="warning" effect="plain"
                  >差異 {{ changedCount }}</el-tag
                >
              </div>
            </div>
          </template>

          <el-form label-position="top">
            <el-form-item>
              <template #label>
                <FieldLabel text="標題" :changed="isChanged('title')" />
              </template>
              <el-input v-model="form.title" placeholder="可留空" />
              <ApplyBtn
                v-if="parsed"
                :disabled="!isChanged('title')"
                @click="applyField('title')"
              />
            </el-form-item>

            <el-form-item required>
              <template #label>
                <FieldLabel text="題幹（必填）" :changed="isChanged('promptText')" />
              </template>
              <el-input
                v-model="form.promptText"
                type="textarea"
                :rows="5"
                placeholder="題幹文字"
              />
              <ApplyBtn
                v-if="parsed"
                :disabled="!isChanged('promptText')"
                @click="applyField('promptText')"
              />
            </el-form-item>

            <el-divider />

            <el-form-item required>
              <template #label>
                <FieldLabel text="選項（A–D 必填）" :changed="isChanged('options')" />
              </template>

              <div style="display: flex; flex-direction: column; gap: 10px">
                <div
                  v-for="k in ['A', 'B', 'C', 'D'] as const"
                  :key="k"
                  style="display: flex; gap: 8px; align-items: flex-start"
                >
                  <el-tag effect="plain" style="width: 36px; justify-content: center">{{
                    k
                  }}</el-tag>
                  <el-input
                    :model-value="getOptionText(k)"
                    @update:model-value="(v: string) => setOptionText(k, v)"
                    placeholder="選項文字"
                  />
                </div>
              </div>

              <div style="margin-top: 8px">
                <ApplyBtn
                  v-if="parsed"
                  :disabled="!isChanged('options')"
                  @click="applyField('options')"
                />
              </div>
            </el-form-item>

            <el-divider />

            <el-row :gutter="12">
              <el-col :span="8">
                <el-form-item>
                  <template #label>
                    <FieldLabel text="正解（可空）" :changed="isChanged('answerKey')" />
                  </template>
                  <el-select v-model="form.answerKey" style="width: 100%">
                    <el-option label="（未知）" value="" />
                    <el-option label="A" value="A" />
                    <el-option label="B" value="B" />
                    <el-option label="C" value="C" />
                    <el-option label="D" value="D" />
                  </el-select>
                  <ApplyBtn
                    v-if="parsed"
                    :disabled="!isChanged('answerKey')"
                    @click="applyField('answerKey')"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="16">
                <el-form-item>
                  <template #label>
                    <FieldLabel text="解析（可空）" :changed="isChanged('answerText')" />
                  </template>
                  <el-input v-model="form.answerText" placeholder="若圖片沒有解析可先留空" />
                  <ApplyBtn
                    v-if="parsed"
                    :disabled="!isChanged('answerText')"
                    @click="applyField('answerText')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <template #label>
                <FieldLabel text="標籤 tags（可空）" :changed="isChanged('tags')" />
              </template>
              <el-select
                v-model="form.tags"
                multiple
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option v-for="t in TAG_OPTIONS" :key="t" :label="t" :value="t" />
              </el-select>
              <ApplyBtn v-if="parsed" :disabled="!isChanged('tags')" @click="applyField('tags')" />
            </el-form-item>

            <el-divider />

            <el-form-item label="我的筆記（可空）">
              <el-input
                v-model="form.noteText"
                type="textarea"
                :rows="3"
                placeholder="你自己的檢討筆記"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import FieldLabel from '@/views/b0000/b0400/components/field-label.vue'
import ApplyBtn from '@/views/b0000/b0400/components/apply-btn.vue'
import { fileToDataUrl } from '@/views/utils/fileToDataUrl'
import { parseQuestionOnClient } from '@/views/b0000/b0400/service/parseQuestionOnClient'
import { onMounted, onBeforeUnmount } from 'vue'
import { apiCreateQuestion } from '@/api/b0400/b0400-api'
import { ElMessage } from 'element-plus'

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return

  for (const it of items) {
    if (it.type.startsWith('image/')) {
      const file = it.getAsFile()
      if (!file) continue

      const reader = new FileReader()
      reader.onload = () => {
        imageUrl.value = reader.result as string
        parsed.value = null
      }
      reader.readAsDataURL(file)

      e.preventDefault()
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('paste', onPaste)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
})

type OptionKey = 'A' | 'B' | 'C' | 'D'

type Option = { key: OptionKey; text: string }

async function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file || !file.type.startsWith('image/')) return

  imageUrl.value = await fileToDataUrl(file)
  parsed.value = null
}

export type Parsed = {
  type: 'mcq'
  title: string
  promptText: string
  options: Option[]
  answerKey: '' | OptionKey
  answerText: string
  tags: string[]
  confidence: 0 | 1 | 2 | 3 | 4 | 5
  warnings: string[]
  raw: { hasImageOnly: boolean; detectedOptionCount: number; detectedAnswerInImage: boolean }
}

type FormState = {
  title: string
  promptText: string
  options: Option[]
  answerKey: '' | OptionKey
  answerText: string
  tags: string[]
  noteText: string
}

type EditableField = 'title' | 'promptText' | 'answerKey' | 'answerText'
type ApplyField = EditableField | 'options' | 'tags'

const parsing = ref(false)
const imageUrl = ref<string>('') // dataURL
const parsed = ref<Parsed | null>(null)
const lastSnapshot = ref<FormState | null>(null)

const form = reactive<FormState>({
  title: '',
  promptText: '',
  options: [
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ],
  answerKey: '',
  answerText: '',
  tags: [],
  noteText: '',
})

const busy = computed(() => parsing.value)

const canSave = computed(() => {
  if (!form.promptText.trim()) return false
  return form.options.every((o) => o.text.trim().length > 0)
})

const TAG_OPTIONS = [
  '',
  '五大句型',
  '時態',
  '被動語態',
  '助動詞',
  '名詞子句',
  '形容詞子句',
  '連接詞',
  '假設語氣',
  '不定詞',
  '動名詞',
  '分詞',
  '形容詞與副詞',
  '代名詞',
  '倒裝句',
  '單字',
  '其他',
]

/**
 * Element Plus <el-upload @change> 的參數是一個 UploadFile
 * https://element-plus.org/
 */
async function onPick(file: UploadFile) {
  const raw = file.raw
  if (!raw) return
  imageUrl.value = await fileToDataUrl(raw)
  parsed.value = null
}

function normalizeOptions(input: Option[]): Option[] {
  const map = new Map<OptionKey, string>()
  for (const it of input) map.set(it.key, it.text ?? '')
  return (['A', 'B', 'C', 'D'] as const).map((k) => ({ key: k, text: map.get(k) ?? '' }))
}

async function parse() {
  if (!imageUrl.value) return
  parsing.value = true
  try {
    // ✅ 讓 parseQuestionOnClient 回傳型別就是 Parsed（你 service 那邊也要是 Promise<ParseQuestionResp>）
    const out = await parseQuestionOnClient(imageUrl.value)
    const fixed: Parsed = {
      ...out,
      options: normalizeOptions(out.options),
    }
    parsed.value = fixed
  } finally {
    parsing.value = false
  }
}

function snapshot(): FormState {
  // reactive 轉 JSON 深拷貝，型別維持 FormState
  return JSON.parse(JSON.stringify(form)) as FormState
}

function applyAll() {
  if (!parsed.value) return
  lastSnapshot.value = snapshot()

  form.title = parsed.value.title ?? ''
  form.promptText = parsed.value.promptText ?? ''
  form.options = normalizeOptions(parsed.value.options)
  form.answerKey = parsed.value.answerKey ?? ''
  form.answerText = parsed.value.answerText ?? ''
  form.tags = (parsed.value.tags ?? []).slice()
}

function undoApply() {
  const s = lastSnapshot.value
  if (!s) return

  form.title = s.title
  form.promptText = s.promptText
  form.options = s.options
  form.answerKey = s.answerKey
  form.answerText = s.answerText
  form.tags = s.tags
  form.noteText = s.noteText
  lastSnapshot.value = null
}

function applyEditableField<K extends EditableField>(field: K) {
  if (!parsed.value) return
  lastSnapshot.value = snapshot()
  form[field] = (parsed.value[field] as FormState[K]) ?? ('' as FormState[K])
}

function applyField(field: ApplyField) {
  if (!parsed.value) return
  lastSnapshot.value = snapshot()

  if (field === 'options') {
    form.options = normalizeOptions(parsed.value.options)
    return
  }
  if (field === 'tags') {
    form.tags = (parsed.value.tags ?? []).slice()
    return
  }
  // 其餘是可直接賦值的字串欄位
  applyEditableField(field)
}

function getOptionText(k: OptionKey) {
  return form.options.find((x) => x.key === k)?.text ?? ''
}
function setOptionText(k: OptionKey, v: string) {
  const it = form.options.find((x) => x.key === k)
  if (it) it.text = v
}

function isChanged(field: ApplyField) {
  if (!parsed.value) return false

  if (field === 'options') {
    const a = normalizeOptions(form.options)
    const b = normalizeOptions(parsed.value.options)
    return a.some((x, i) => x.text.trim() !== (b[i]?.text ?? '').trim())
  }

  if (field === 'tags') {
    const a = form.tags.slice().sort().join('|')
    const b = (parsed.value.tags ?? []).slice().sort().join('|')
    return a !== b
  }

  const a = String(form[field] ?? '').trim()
  const b = String(parsed.value[field] ?? '').trim()
  return a !== b
}

const changedCount = computed(() => {
  if (!parsed.value) return 0
  return (['title', 'promptText', 'options', 'answerKey', 'answerText', 'tags'] as const).filter(
    (f) => isChanged(f),
  ).length
})

function resetAll() {
  imageUrl.value = ''
  parsed.value = null
  lastSnapshot.value = null

  form.title = ''
  form.promptText = ''
  form.options = normalizeOptions([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ])
  form.answerKey = ''
  form.answerText = ''
  form.tags = []
  form.noteText = ''
}

async function save() {
  if (!canSave.value || busy.value) return

  parsing.value = true
  try {
    await apiCreateQuestion({
      title: form.title,
      promptText: form.promptText,
      options: form.options,
      answerKey: form.answerKey,
      answerText: form.answerText,
      tags: form.tags,
      noteText: form.noteText,
    })

    ElMessage.success('已儲存')
    resetAll()
  } finally {
    parsing.value = false
  }
}
</script>
