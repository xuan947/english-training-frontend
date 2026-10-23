/**
 * 格式化日期為 YYYY-MM-DD
 * @param iso ISO 格式的日期字串
 */
export const formatYMD = (iso?: string | null): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
};
