<script setup>

import {useConfigStore} from "../pinia/config.js";

const configStore=useConfigStore()
const togglePlugin = async () => {
  configStore.appState.domainConfig.pluginEnabled=!configStore.appState.domainConfig.pluginEnabled
  await configStore.appState.saveDomainConfig() //保存到storage
  await configStore.notifyContentScript("PLUGIN_TOGGLE") //通知content
  await configStore.notifyBackgroundScript("PLUGIN_TOGGLE") //通知content
};
</script>

<template>
  <div class="setting-item">
    <label>
      <input
          type="checkbox"
          v-model="configStore.appState.domainConfig.pluginEnabled"
          @change="togglePlugin"
      />
      启用插件
    </label>
  </div>
</template>

<style scoped>

</style>