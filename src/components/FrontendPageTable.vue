<template>
  <div class="frontend-page-table">
    <el-table
      ref="tableRef"
      :data="pagedDataWithKey"
      stripe
      style="width: 100%"
      :empty-text="emptyText"
      :show-overflow-tooltip="showOverflowTooltip"
      :row-key="(row: { row_key: any }) => row.row_key"
      @row-click="clickRow"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="enableSelection" type="selection" width="55" />
      <slot />
    </el-table>

    <el-row v-if="showPagination" class="pagination-wrapper">
      <el-col :span="24">
        <el-pagination
          class="pagination-center"
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 30, 40, 50, 100, 200]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, onMounted } from 'vue'
import { isNil } from 'lodash-es'
import type { TableColumnCtx } from 'element-plus'
import { useFrontendPageTable } from '@/utils/useFrontendPageTable'

// ---------- Props ----------
interface TableColumn {
  prop: string
}

interface Props<U> {
  api?: () => Promise<{ data: U[] }>
  queryObj?: Record<string, unknown>
  tableColumns?: TableColumn[]
  autoQry?: boolean
  showPagination?: boolean
  showOverflowTooltip?: boolean
  enableSelection?: boolean
  handleRowFunc?: (row: U) => void
}

const props = withDefaults(defineProps<Props<T>>(), {
  queryObj: () => ({}),
  tableColumns: () => [],
  autoQry: true,
  showPagination: true,
  showOverflowTooltip: true,
  enableSelection: false,
})

// ---------- Emits ----------
const emit = defineEmits<{
  (e: 'selection-change', rows: T[]): void
}>()

// ---------- 狀態 ----------
const tableData = ref<T[]>([])
const selectedRows = ref<T[]>([])
const emptyText = '查無資料'

// ⭐ 與參考檔一致命名
const page = ref(1)
const pageSize = ref(10)

// ---------- 過濾 ----------
const filteredData = computed(() => {
  let list = [...tableData.value]
  const query = props.queryObj || {}

  Object.entries(query).forEach(([key, value]) => {
    if (isNil(value) || value === '' || value === 'all') return

    if (key === 'keyword') {
      const kw = String(value).toLowerCase()
      list = list.filter((row) =>
        props.tableColumns.some((col) =>
          String(row[col.prop] ?? '')
            .toLowerCase()
            .includes(kw),
        ),
      )
    } else {
      list = list.filter((row) => String(row[key]) === String(value))
    }
  })

  return list as T[]
})

// ---------- 前端分頁 ----------
const { pagedData } = useFrontendPageTable(filteredData, page, pageSize)

// ⭐ 統一 row_key
const pagedDataWithKey = computed(() =>
  pagedData.value.map((row, idx) => ({
    ...row,
    row_key: `${idx}`,
  })),
)

// ---------- API ----------
const fetchData = async () => {
  if (!props.api) {
    tableData.value = []
    return
  }
  const res = await props.api()
  tableData.value = Array.isArray(res?.data) ? res.data : []
  page.value = 1 // ⭐ 查詢後回到第一頁（參考檔行為）
}

// ---------- 事件 ----------
const clickRow = (row: T, column: TableColumnCtx<T>) => {
  if (column?.property !== 'op' && props.handleRowFunc) {
    props.handleRowFunc(row)
  }
}

const handleSelectionChange = (rows: T[]) => {
  selectedRows.value = rows
  emit('selection-change', rows)
}

// ---------- Lifecycle ----------
onMounted(async () => {
  if (props.autoQry) await fetchData()
})

// ---------- 對外介面（⭐ 關鍵） ----------
defineExpose({
  fetchData,
  page,
  pageSize,
  getSelectedRows: () => selectedRows.value,
})
</script>
<style lang="css" scoped>
.pagination-wrapper {
  margin-top: 24px; /* 與表格的距離 */
}

.pagination-center {
  width: fit-content;
  margin: 0 auto;
}
</style>
