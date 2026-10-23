<template>
  <el-card shadow="never">
    <template #header>
      <el-row justify="space-between" align="middle">
        <el-col :span="12">
          <h2 style="margin: 0">{{ TEXT.TITLE() }}</h2>
          <el-text type="info">{{ TEXT.TOTAL(bankSize) }}</el-text>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="primary" @click="handleOpenModal(null)">
            {{ TEXT.BTN.CREATE() }}
          </el-button>
        </el-col>
      </el-row>
    </template>

    <el-form label-position="top" style="margin-bottom: 16px">
      <el-form-item :label="TEXT.UPLOAD.LABEL()">
        <el-upload
          :show-file-list="false"
          :auto-upload="false"
          accept=".xlsx,.xls"
          @change="onUpload"
        >
          <el-button>{{ TEXT.BTN.CREATE() }}</el-button>
        </el-upload>
        <el-text type="info">
          {{ TEXT.UPLOAD.TIP() }}
        </el-text>
      </el-form-item>
    </el-form>

    <el-form label-position="left">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <el-form-item :label="TEXT.FILTER.KEYWORD_LABEL()">
            <el-input v-model="query.keyword" :placeholder="TEXT.FILTER.KEYWORD()" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item :label="TEXT.FILTER.MEMO_LABEL()">
            <el-select v-model="query.memorizedLevelLabel" style="width: 100%">
              <el-option label="全部" value="all" />
              <el-option v-for="label in MEMO_LABELS" :key="label" :label="label" :value="label" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item :label="TEXT.FILTER.EXAM_LABEL()">
            <el-select v-model="query.examStatusLabel" style="width: 100%">
              <el-option label="全部" value="all" />
              <el-option
                v-for="label in EXAM_STATUS_LABELS"
                :key="label"
                :label="label"
                :value="label"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item label="顯示欄位">
            <el-space>
              <el-checkbox v-model="showEn">{{ TEXT.FILTER.SHOW_EN() }}</el-checkbox>
              <el-checkbox v-model="showZh">{{ TEXT.FILTER.SHOW_ZH() }}</el-checkbox>
            </el-space>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <FrontendPageTable
      ref="tableRef"
      :api="fetchTableData"
      :query-obj="query"
      :table-columns="searchColumns"
    >
      <el-table-column type="index" :label="TEXT.TABLE.INDEX()" width="45" align="center" />

      <el-table-column v-if="showEn" prop="englishWord" :label="TEXT.TABLE.EN()" width="180">
        <template #default="{ row }">
          <el-space>
            <strong>{{ row.englishWord }}</strong>
            <el-button size="small" type="primary" plain @click.stop="playSpeech(row.englishWord)">
              {{ COMMON.BTN.PLAY() }}
            </el-button>
          </el-space>
        </template>
      </el-table-column>

      <el-table-column prop="partOfSpeech" :label="TEXT.TABLE.POS()" width="70" align="center" />

      <el-table-column
        v-if="showZh"
        prop="chineseMeaning"
        :label="TEXT.TABLE.ZH()"
        min-width="120"
      />

      <el-table-column :label="TEXT.TABLE.NOTE()" min-width="200">
        <template #default="{ row }">
          <div style="white-space: pre-line">{{ row.note || '—' }}</div>
        </template>
      </el-table-column>

      <el-table-column
        prop="examStatusLabel"
        :label="TEXT.TABLE.EXAM()"
        width="100"
        align="center"
      />
      <el-table-column
        prop="memorizedLevelLabel"
        :label="TEXT.TABLE.MEMO()"
        width="100"
        align="center"
      />

      <el-table-column :label="TEXT.TABLE.UPDATED_AT()" width="120" align="center">
        <template #default="{ row }">
          {{ formatYMD(row.updatedAt) || '—' }}
        </template>
      </el-table-column>

      <el-table-column :label="TEXT.TABLE.ACTION()" width="220" fixed="right" align="center">
        <template #default="{ row }">
          <el-space>
            <el-button size="small" @click="handleOpenModal(row)">
              {{ COMMON.BTN.EDIT() }}
            </el-button>

            <el-button
              size="small"
              type="warning"
              :disabled="row.memorizedLevel <= 0"
              @click="changeMemorizedLevel(row, -1)"
            >
              -
            </el-button>
            <el-button
              size="small"
              type="success"
              :disabled="row.memorizedLevel >= 4"
              @click="changeMemorizedLevel(row, 1)"
            >
              +
            </el-button>
            <el-button size="small" type="danger" @click="onDelete(row)">
              {{ COMMON.BTN.DELETE() }}
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </FrontendPageTable>
  </el-card>

  <B0100WordDialog
    ref="dialogRef"
    :create-one="createOne"
    :update-one="updateOne"
    @saved="handleSaved"
  />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FrontendPageTable from '@/components/FrontendPageTable.vue'
import B0100WordDialog from '@/views/b0000/b0100/components/b0100WordDialog.vue'
import { useWordBank } from '@/views/b0000/b0100/service/b0100Svc'
import type { WordItem } from '@/views/b0000/b0100/type/b0100Type'
import { EXAM_STATUS_LABELS, MEMO_LABELS } from '@/consts/business'
import { formatYMD } from '@/utils/date'
import { playSpeech } from '@/utils/speech'
import { B0100_TEXT as TEXT } from '@/views/b0000/b0100/consts/b0100'
import { COMMON } from '@/consts/common'

defineOptions({ name: 'B0100View' })

const { bankSize, fetchBank, uploadExcel, createOne, updateOne, deleteOne, setMemorized } =
  useWordBank()
const tableRef = ref<{ fetchData: () => Promise<void> } | null>(null)
const showEn = ref(true)
const showZh = ref(true)

/**
 * 關鍵字搜尋欄位
 */
const searchColumns = [
  { prop: 'englishWord' },
  { prop: 'partOfSpeech' },
  { prop: 'chineseMeaning' },
]

/**
 * 統一管理搜尋條件，Key 名稱需對應 WordItem 內的屬性
 */
const query = reactive({
  keyword: '',
  memorizedLevelLabel: 'all',
  examStatusLabel: 'all',
})

/**
 * 取得表格資料
 */
const fetchTableData = async () => {
  const data = await fetchBank()
  return { data }
}

/**
 * 彈窗控制
 */
const dialogRef = ref<InstanceType<typeof B0100WordDialog> | null>(null)

const handleOpenModal = (item: WordItem | null = null) => {
  dialogRef.value?.open(item)
}

const handleSaved = () => {
  tableRef.value?.fetchData()
}

/**
 * 刪除單筆資料
 */
const onDelete = async (WordItem: WordItem) => {
  await ElMessageBox.confirm(TEXT.MESSAGE.DELETE_CONFIRM(WordItem.englishWord), COMMON.BTN.CONFIRM(), {
    type: 'warning',
  })
  await deleteOne(WordItem.wordId)
  ElMessage.success(COMMON.MESSAGE.DELETE_SUCCESS())
  tableRef.value?.fetchData()
}

/**
 * 上傳 Excel 檔案
 */
const onUpload = async (file: { raw: File }) => {
  await uploadExcel(file.raw)
  ElMessage.success(TEXT.MESSAGE.UPLOAD_SUCCESS())
  tableRef.value?.fetchData()
}

/**
 * 更新熟悉度
 */
const changeMemorizedLevel = async (WordItem: WordItem, delta: -1 | 1) => {
  const curLevel = Number(WordItem.memorizedLevel ?? 0)
  const nextLevel = Math.min(4, Math.max(0, curLevel + delta))
  if (nextLevel === curLevel) return

  try {
    await setMemorized(WordItem, nextLevel)
    WordItem.memorizedLevel = nextLevel
    WordItem.memorizedLevelLabel = MEMO_LABELS[nextLevel]
    ElMessage.success(TEXT.MESSAGE.MEMO_UPDATE(WordItem.memorizedLevelLabel ?? ''))
  } catch {
    ElMessage.error(TEXT.MESSAGE.ERROR())
  }
}
</script>
