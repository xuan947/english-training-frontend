<template>
  <div style="margin-top: 6px; display:flex; justify-content:flex-end;">
    <el-button size="small" type="primary" plain :disabled="disabled" @click="$emit('click')">
      套用解析
    </el-button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ disabled: boolean }>()
defineEmits<{ (e:'click'): void }>()
</script>
