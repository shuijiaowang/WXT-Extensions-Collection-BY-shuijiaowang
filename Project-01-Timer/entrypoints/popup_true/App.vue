<script setup>
import {onMounted, ref} from 'vue';
import GlobalConfigPanel from '../../components/GlobalConfigPanel.vue';
import {appState} from '../../core/config.js';
import {createCountdownTask, startCountdownTask} from '../../core/countdown.js';
import {useConfigStore} from "@/pinia/config.js";
const store = useConfigStore();
const nameInput = ref('');
const secondsInput = ref(60);
const tasks = ref([]);
const lastError = ref('');

function notifyChange() {
  return browser.runtime.sendMessage({type: 'change'});
}

async function loadTasks() {
  lastError.value = '';
  tasks.value = (await appState.reminderTasksStorage.getValue()) ?? [];
}

async function createTask() {
  lastError.value = '';
  const sec = Number(secondsInput.value);
  if (!Number.isFinite(sec) || sec <= 0) {
    lastError.value = '请输入有效秒数';
    return;
  }
  appState.reminderTasks = (await appState.reminderTasksStorage.getValue()) ?? [];
  const name = nameInput.value.trim() || '倒计时';
  await createCountdownTask(name, sec);
  await notifyChange();
  nameInput.value = '';
  await loadTasks();
}

async function startTask(taskId) {
  lastError.value = '';
  appState.reminderTasks = (await appState.reminderTasksStorage.getValue()) ?? [];
  const task = appState.reminderTasks.find((t) => t.id === taskId);
  if (task) {
    startCountdownTask(task);
    await appState.saveReminderTasks();
  }
  await notifyChange();
  await loadTasks();
}


onMounted(loadTasks);
</script>

<template>
  <div class="wrap">
    <h1 class="title">倒计时 Demo</h1>

    <section class="form">
      <input
          v-model="nameInput"
          class="input"
          type="text"
          placeholder="名称（可选）"
          maxlength="32"
      />
      <div class="row">
        <label class="label">秒数</label>
        <input v-model.number="secondsInput" class="input num" type="number" min="1" step="1"/>
        <button type="button" @click="createTask">创建</button>
      </div>
    </section>

    <p v-if="lastError" class="err">{{ lastError }}</p>

    <section class="list-section">
      <h2 class="sub">任务列表</h2>
      <p v-if="!tasks.length" class="muted">暂无任务，先创建一个。</p>
      <ul v-else class="list">
        <li v-for="t in tasks" :key="t.id" class="item">
          <div class="meta">
            <span class="nm">{{ t.name }}</span>
            <span class="st">{{ t.status }}</span>
            <span class="sec">{{ t.totalSeconds }}s</span>
          </div>
          <button
              v-if="t.type === 'countdown' && t.status === 'idle'"
              type="button"
              class="start"
              @click="startTask(t.id)"
          >
            启动
          </button>
        </li>
      </ul>
    </section>

    <GlobalConfigPanel/>
  </div>
</template>

<style scoped>
.wrap {
  text-align: left;
  min-width: 280px;
  padding: 0.5rem 0;
}

.title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.sub {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.label {
  font-size: 0.875rem;
  white-space: nowrap;
}

.input {
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(127, 127, 127, 0.4);
  font: inherit;
  background: transparent;
}

.input.num {
  flex: 0 0 5rem;
  max-width: 6rem;
}

.err {
  margin: 0.75rem 0 0;
  color: #e85d5d;
  font-size: 0.875rem;
}

.muted {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.7;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(127, 127, 127, 0.35);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
  font-size: 0.875rem;
}

.nm {
  font-weight: 500;
}

.st {
  opacity: 0.85;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
}

.sec {
  opacity: 0.75;
}

.start {
  flex-shrink: 0;
}
</style>
