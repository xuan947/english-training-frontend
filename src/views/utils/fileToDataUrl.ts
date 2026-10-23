/**
 * 將 File / Blob 轉成 base64 data URL
 *
 * @example
 * const dataUrl = await fileToDataUrl(file)
 * <img :src="dataUrl" />
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('FileReader result is not a string'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}
