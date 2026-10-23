<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :append-to-body="true"
    modal-class="word-dialog-mask"
  >
    <el-form label-position="top">
      <el-form-item label="英文" required>
        <el-input v-model="form.englishWord" />
      </el-form-item>

      <el-form-item label="詞性">
        <el-input v-model="form.partOfSpeech" placeholder="n. / v. / adj." />
      </el-form-item>

      <el-form-item label="中文">
        <el-input v-model="form.chineseMeaning" />
      </el-form-item>

      <el-form-item label="備註">
        <el-input v-model="form.note" type="textarea" :rows="3" maxlength="300" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">儲存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { WordItem, WordUpsertReq } from '@/views/b0000/b0100/type/b0100Type'

// 1. 移除 mode 和 editingItem 的 Props
const props = defineProps<{
  createOne: (req: WordUpsertReq) => Promise<unknown>
  updateOne: (wordId: number, req: WordUpsertReq) => Promise<unknown>
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

// 2. 改用內部的狀態
const visible = ref(false)
const saving = ref(false)
const mode = ref<'create' | 'edit'>('create')
const editingItem = ref<WordItem | null>(null)

const title = computed(() => (mode.value === 'create' ? '新增單字' : '修改單字'))

const form = ref<WordUpsertReq>({
  englishWord: '',
  partOfSpeech: '',
  chineseMeaning: '',
  note: '',
  memorizedLevel: 0,
})

// 3. 暴露給父組件的唯一入口
const open = (item: WordItem | null = null) => {
  console.log('item', JSON.stringify(item))
  editingItem.value = item
  mode.value = item ? 'edit' : 'create'
  console.log('mode.value:', mode.value)

  if (!item) {
    // 新增模式：重置表單
    form.value = {
      englishWord: '',
      partOfSpeech: '',
      chineseMeaning: '',
      note: '',
      memorizedLevel: 0,
    }
  } else {
    // 編輯模式：帶入資料
    form.value = {
      englishWord: item.englishWord,
      partOfSpeech: item.partOfSpeech,
      chineseMeaning: item.chineseMeaning,
      note: item.note ?? '',
      memorizedLevel: item.memorizedLevel ?? 0,
    }
  }
  visible.value = true
}

// 4. 提交邏輯
async function submit() {
  if (!form.value.englishWord.trim()) {
    ElMessage.warning('英文必填')
    return
  }
  saving.value = true
  try {
    if (mode.value === 'create') {
      await props.createOne(form.value)
    } else {
      const id = editingItem.value?.wordId
      if (!id) return
      await props.updateOne(id, form.value)
    }
    ElMessage.success('儲存成功')
    emit('saved')
    visible.value = false
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
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
