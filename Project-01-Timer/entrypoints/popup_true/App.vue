<script setup>
import GlobalConfigPanel from '../../components/GlobalConfigPanel.vue';
import CountdownPanel from '../../components/CountdownPanel.vue';


</script>

<template>
  <div class="wrap">
    <CountdownPanel/>
    <GlobalConfigPanel/>
  </div>
</template>

<style scoped>
.wrap {
  text-align: left;
  min-width: 280px;
  padding: 0.5rem 0;
}
</style>
