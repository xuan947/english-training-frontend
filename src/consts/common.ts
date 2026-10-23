export const COMMON = {
  BTN: {
    CONFIRM: () => '確認',
    CANCEL: () => '取消',
    CREATE: () => '新增',
    EDIT: () => '修改',
    DELETE: () => '刪除',
    PLAY: () => '發音',
  },

  MESSAGE: {
    DELETE_CONFIRM: (target: string) => `確定要刪除「${target}」嗎？`,
    DELETE_SUCCESS: () => '已刪除',
    SAVE_SUCCESS: () => '儲存成功',
    ERROR: () => '操作失敗',
  },
} as const
