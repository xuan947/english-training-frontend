export const B0100_TEXT = {
  TITLE: () => '題庫清單',
  TOTAL: (count: number) => `目前題庫共 ${count} 筆`,

  BTN: {
    CREATE: () => '新增單字',
  },

  TABLE: {
    INDEX: () => '#',
    EN: () => '英文',
    ZH: () => '中文',
    POS: () => '詞性',
    NOTE: () => '備註',
    EXAM: () => '考試狀態',
    MEMO: () => '熟悉度',
    UPDATED_AT: () => '更新時間',
    ACTION: () => '操作',
  },

  FILTER: {
    KEYWORD_LABEL: () => '關鍵字搜尋',
    KEYWORD: () => '搜尋（英文 / 中文 / 詞性）',
    MEMO_LABEL: () => '熟悉度',
    MEMO_ALL: () => '全部',
    EXAM_LABEL: () => '考試狀態',
    EXAM_ALL: () => '全部',
    SHOW_LABEL: () => '顯示欄位',
    SHOW_EN: () => '英文',
    SHOW_ZH: () => '中文',
  },

  UPLOAD: {
    LABEL: () => '匯入 Excel（.xlsx / .xls）',
    TIP: () => '欄位：word / pos / zh / note',
  },

  MESSAGE: {
    DELETE_CONFIRM: (word: string) => `確定要刪除「${word}」嗎？`,
    UPLOAD_SUCCESS: () => '匯入完成',
    MEMO_UPDATE: (label: string) => `熟悉度更新：${label}`,
    ERROR: () => '更新失敗',
  },
} as const
