<script setup>
import { useConfigStore } from '../pinia/config.js';

const store = useConfigStore();

/** 与 DEFAULT_GLOBAL_CONFIG.workdayWeeks 一致：1–7 表示周一至周日 */
const WEEK_LABELS = [
  { v: 1, label: '一' },
  { v: 2, label: '二' },
  { v: 3, label: '三' },
  { v: 4, label: '四' },
  { v: 5, label: '五' },
  { v: 6, label: '六' },
  { v: 7, label: '日' },
];

function toggleWorkday(v) {
  const w = store.appState.globalConfig.workdayWeeks;
  console.log(w,w,w,w,w,w,w,w)
  const i = w.indexOf(v);
  if (i >= 0) w.splice(i, 1);
  else w.push(v);
  w.sort((a, b) => a - b);
}

async function save() {
  await store.persistGlobalConfig();
}
</script>

<template>
  <section class="cfg">
    <h2 class="sub">全局配置</h2>

    <label class="row">
      <input v-model="store.appState.globalConfig.requireInteraction" type="checkbox"/>
      <span>通知需手动关闭</span>
    </label>

    <label class="row">
      <input v-model="store.appState.globalConfig.silent" type="checkbox"/>
      <span>静音（无系统提示音）</span>
    </label>

    <div class="week">
      <span class="week-title">工作日</span>
      <div class="week-btns">
        <button
            v-for="d in WEEK_LABELS"
            :key="d.v"
            type="button"
            class="day"
            :class="{ on: store.appState.globalConfig.workdayWeeks?.includes(d.v) }"
            @click="toggleWorkday(d.v)"
        >
          {{ d.label }}
        </button>
      </div>
    </div>

    <button type="button" class="save" @click="save">保存配置</button>
  </section>
</template>

<style scoped>
.cfg {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(127, 127, 127, 0.35);
}

.sub {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.35rem 0;
  font-size: 0.875rem;
  cursor: pointer;
}

.week {
  margin: 0.65rem 0;
}

.week-title {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.35rem;
  opacity: 0.9;
}

.week-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.day {
  min-width: 2rem;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  border: 1px solid rgba(127, 127, 127, 0.45);
  background: transparent;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}

.day.on {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.save {
  margin-top: 0.5rem;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  border: 1px solid rgba(127, 127, 127, 0.45);
  font: inherit;
  cursor: pointer;
}
</style>
