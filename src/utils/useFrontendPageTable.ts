import { ref, computed, type Ref, isRef } from 'vue'

/**
 * 前端分頁邏輯 Hook
 * @param dataSourceRef 資料來源 (Ref 陣列)
 * @param pageOrDefaultPage 外部 page Ref 或預設頁碼
 * @param sizeOrDefaultSize 外部 pageSize Ref 或預設筆數
 */
export function useFrontendPageTable<T>(
  dataSourceRef: Ref<T[]>,
  pageOrDefaultPage: Ref<number> | number = 1,
  sizeOrDefaultSize: Ref<number> | number = 10,
) {
  // ⭐ 關鍵：支援外部注入或內部建立
  const currentPage: Ref<number> = isRef(pageOrDefaultPage)
    ? pageOrDefaultPage
    : ref(pageOrDefaultPage)

  const pageSize: Ref<number> = isRef(sizeOrDefaultSize)
    ? sizeOrDefaultSize
    : ref(sizeOrDefaultSize)

  // 根據當前頁碼與筆數計算切片資料
  const pagedData = computed<T[]>(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return dataSourceRef.value.slice(start, end)
  })

  const handleCurrentChange = (val: number): void => {
    currentPage.value = val
  }

  const handlePageSizeChange = (val: number): void => {
    pageSize.value = val
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    pagedData,
    handleCurrentChange,
    handlePageSizeChange,
  }
}
