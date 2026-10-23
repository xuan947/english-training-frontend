/**
 * 表格欄位內容位置
 */
export const ALIGN = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
} as const;

// 定義一個導出的型別，方便在 Props 中使用
export type AlignType = (typeof ALIGN)[keyof typeof ALIGN];
