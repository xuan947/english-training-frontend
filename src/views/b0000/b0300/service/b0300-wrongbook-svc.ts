import { ref } from 'vue'
import type { WrongWordRow } from '@/views/b0000/b0300/type/b0300-wrongbook-type'
import { fetchWrongWords } from '@/api/b0300/b0300-api'

export function useWrongBook() {
  const loading = ref(false)
  const rows = ref<WrongWordRow[]>([])

  async function loadWrongWords() {
    loading.value = true
    try {
      const data = await fetchWrongWords()
      rows.value = Array.isArray(data) ? data : []
    } finally {
      loading.value = false
    }
  }

  return { loading, rows, loadWrongWords }
}
