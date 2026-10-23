<template>
  <div style="display:flex; align-items:center; gap:8px;">
    <span>{{ text }}</span>
    <el-tag v-if="changed" type="warning" effect="plain" size="small">有差異</el-tag>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text: string; changed: boolean }>()
</script>
