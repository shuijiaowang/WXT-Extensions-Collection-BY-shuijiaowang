<script setup>
import { i18n } from '#i18n';
const t = i18n.t; // 简化i18n调用
</script>

<template>
  <p>
    {{ t('test.test1') }}
  </p>
  <p>
    {{ t('test3') }}
  </p>
</template>

<style scoped>

</style>