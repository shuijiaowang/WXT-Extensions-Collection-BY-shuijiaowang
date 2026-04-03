// core/config.js
/**
 * 全局配置结构（单独存储，解决工作日自定义/全局默认配置）
 */
export const DEFAULT_GLOBAL_CONFIG = {
    requireInteraction: false, //true:需要点击关闭
    silent: false, //false:有声音提醒
    workdayWeeks: [1,2,3,4,5],             // 自定义工作日（全局唯一配置）
    version: "1.0.0",                     // 配置版本（后续拓展兼容用）
};
export const appState = {
    globalConfigStorage:storage.defineItem(`local:reminder_global_config`, {
        fallback: DEFAULT_GLOBAL_CONFIG //不存在则创建并存储
    }),
    globalConfig: {},
    saveGlobalConfig:async () => {
        await appState.globalConfigStorage.setValue(appState.globalConfig)
    },
    reminderTasksStorage:storage.defineItem(`local:reminder_tasks`, {
        // fallback: DEFAULT_GLOBAL_CONFIG //不存在则创建并存储
    }),
    reminderTasks: [],
    saveReminderTasks:async () => {
        await appState.reminderTasksStorage.setValue(appState.reminderTasks)
    }
};
