import {initMessaging} from "../core/messaging.js";
import {appState} from "../core/config.js";
import {
    ensureCountdownRunning,
    getNearestTriggerTask,
    handleTaskTrigger,
    now,
} from "../core/taskScheduler.js";
import {createCountdownTask} from "../core/countdown.js";
import {showReminderNotification} from "../core/reminderNotification.js";

export default defineBackground(async () => {
    console.log('Background script started', {id: browser?.runtime?.id});
    initMessaging() //初始化所有监听
    appState.globalConfig=await  appState.globalConfigStorage.getValue()
    appState.reminderTasks = (await appState.reminderTasksStorage.getValue()) ?? []

    setTimeout(()=>{
        showReminderNotification({
            title:"t",
            message:"m"
        },{
            silent:true,
        })
    },3000)

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

        const delayMs = Math.max(0, nearestTask.targetTime - now());

        console.log(`⏱ 即将执行任务: ${nearestTask.name}`, `等待 ${(delayMs / 1000).toFixed(1)}s`);

        currentTimeoutId = setTimeout(async () => {
            await handleTaskTrigger(nearestTask);
            await scheduleNextTask();
        }, delayMs);
    }

    /** 从 storage 拉回任务列表并重建调度（popup 改库后发无参 { type: 'change' } 即可） */
    async function reinitFromStorage() {
        appState.reminderTasks = (await appState.reminderTasksStorage.getValue()) ?? [];
        await scheduleNextTask();
    }

    browser.runtime.onMessage.addListener(async (msg) => {
        if (msg.type === 'change') {
            await reinitFromStorage();
        }
    });

    // 模拟：两个倒计时（实际应由 popup 写入后再 scheduleNextTask）
    const t1 = await createCountdownTask('测试', 20);
    const t2 = await createCountdownTask('测试2', 40);
    await ensureCountdownRunning(t1);
    await ensureCountdownRunning(t2);
    await scheduleNextTask();

});
