// core/config.js
import {scheduleNextTask} from "@/core/taskScheduler.js";
import {init} from "@/core/init.js";
import {notifyPopup} from "@/core/messaging.js";

/**
 * 全局配置结构（单独存储，解决工作日自定义/全局默认配置）
 */
export const DEFAULT_GLOBAL_CONFIG = {
    requireInteraction: false, //true:需要点击关闭
    silent: true, //false:有声音提醒
    workdayWeeks: [1,2,3,4,5],             // 自定义工作日（全局唯一配置）
    version: "1.0.0",                     // 配置版本（后续拓展兼容用）
};
export const appState = {
    globalConfigStorage:storage.defineItem(`local:reminder_global_config`, {
        init: () => ({ ...DEFAULT_GLOBAL_CONFIG })//不存在则创建并存储
    }),
    globalConfig: {
        ...DEFAULT_GLOBAL_CONFIG,
    },
    saveGlobalConfig:async () => {
        await appState.globalConfigStorage.setValue(appState.globalConfig)
        await notifyPopup()
    },
    // unwatchGlobalConfig:storage.watch('local:reminder_global_config', async (newValue,oldValue) => {
    //     await init()
    // }),
    reminderTasksStorage:storage.defineItem(`local:reminder_tasks`, {
        // fallback: DEFAULT_GLOBAL_CONFIG //不存在则创建并存储
    }),
    reminderTasks: [],
    saveReminderTasks:async () => {
        await appState.reminderTasksStorage.setValue(appState.reminderTasks)
        await notifyPopup()
    },
    // unwatchReminderTasks:storage.watch('local:reminder_tasks', async (newValue,oldValue) => {
    //     await init()
    // }),
};
