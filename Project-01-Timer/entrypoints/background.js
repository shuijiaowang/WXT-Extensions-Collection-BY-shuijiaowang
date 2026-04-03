import { initMessaging } from "../core/messaging.js";
import { appState } from "../core/config.js";
import {
    now,
    getNearestTriggerTask,
    ensureCountdownRunning,
    getTaskTriggerTime,
    handleTaskTrigger,
} from "../core/taskScheduler.js";
import { createCountdownTask, startCountdownTask } from "../core/countdown.js";

export default defineBackground(async () => {
    console.log('Background script started', { id: browser?.runtime?.id });
    initMessaging() //初始化所有监听
    appState.reminderTasks = (await appState.reminderTasksStorage.getValue()) ?? []

    /**
     * 【核心】调度：找到最近要触发的任务，设置 setTimeout
     * 每次任务增删改、触发完成，都调用一次
     */
    let currentTimeoutId = null;
    async function scheduleNextTask() {
        if (currentTimeoutId) {
            clearTimeout(currentTimeoutId);
            currentTimeoutId = null;
        }

        // 找到最近要触发的任务
        const nearestTask = getNearestTriggerTask(now());
        if (!nearestTask) {
            console.log("✅ 暂无待执行任务");
            return;
        }

        await ensureCountdownRunning(nearestTask);

        const delayMs = Math.max(0, getTaskTriggerTime(nearestTask) - now());

        console.log(`⏱ 即将执行任务: ${nearestTask.name}`, `等待 ${(delayMs / 1000).toFixed(1)}s`);

        currentTimeoutId = setTimeout(async () => {
            await handleTaskTrigger(nearestTask);
            await scheduleNextTask();
        }, delayMs);
    }

    // 模拟：两个倒计时（实际应由 popup 写入后再 scheduleNextTask）
    const t1 = await createCountdownTask('测试',  20);
    const t2 = await createCountdownTask('测试2',  40);
    await ensureCountdownRunning(t1);
    await ensureCountdownRunning(t2);
    await scheduleNextTask();

});
