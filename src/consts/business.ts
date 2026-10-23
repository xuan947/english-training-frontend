/**
 * 熟悉度 (Memorized Levels)
 */
export const MEMO_LABELS = ['未接觸', '有印象', '看得懂', '用得出', '熟練'] as const

/**
 * 考試狀態 (Exam Status)
 */
export const EXAM_STATUS_LABELS = ['尚未通過', '偶爾正確', '穩定', '合格'] as const

/**
 * 提取型別 (方便在 Props 或 Ref 中使用)
 */
export type MemoLevelLabel = (typeof MEMO_LABELS)[number]
export type ExamStatusLabel = (typeof EXAM_STATUS_LABELS)[number]

/**
 * 如果需要數值映射 (例如 0 -> '未接觸')
 */
export const MEMO_MAP: Record<number, MemoLevelLabel> = {
  0: '未接觸',
  1: '有印象',
  2: '看得懂',
  3: '用得出',
  4: '熟練',
}
