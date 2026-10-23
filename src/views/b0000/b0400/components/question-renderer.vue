<template>
  <div class="q-text">
    <template v-for="(t, idx) in tokens" :key="idx">
      <button
        v-if="t.kind === 'word'"
        class="word"
        type="button"
        @click="$emit('word-click', t.value)"
      >
        {{ t.value }}
      </button>
      <span v-else>{{ t.value }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Tok = { kind: 'word' | 'text'; value: string }

const props = defineProps<{
  text?: string | null
}>()

defineEmits<{
  (e: 'word-click', word: string): void
}>()

// 英文單字：先用簡單 regex，後續可再加片語、多字選取
const tokens = computed<Tok[]>(() => {
  const s = props.text ?? ''
  if (!s) return []

  const out: Tok[] = []
  const re = /[A-Za-z]+(?:'[A-Za-z]+)?/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(s)) !== null) {
    const start = m.index
    const end = start + m[0].length
    if (start > last) out.push({ kind: 'text', value: s.slice(last, start) })
    out.push({ kind: 'word', value: s.slice(start, end) })
    last = end
  }
  if (last < s.length) out.push({ kind: 'text', value: s.slice(last) })
  return out
})
</script>

<style scoped>
.q-text {
  line-height: 1.9;
  white-space: pre-wrap;
  word-break: break-word;
}

.word {
  padding: 0 2px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--el-text-color-primary);
  text-decoration-color: var(--el-color-primary);
  font-size: 1.15em;
  font-weight: 600;

  text-decoration: underline;
  text-underline-offset: 3px;
}

.word:hover {
  opacity: 0.85;
}
</style>
