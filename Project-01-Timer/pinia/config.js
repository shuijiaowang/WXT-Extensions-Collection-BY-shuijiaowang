import {defineStore} from 'pinia';
import {reactive} from 'vue';
import {appState, DEFAULT_GLOBAL_CONFIG,} from '../core/config.js';

/**
 * 全局只有一份 appState（core）。Popup 里需要响应式，所以在 init 时把 globalConfig 换成 reactive，
 * 之后界面和 background 都读 appState.globalConfig 即可，不必再维护第二个名字。
 */
export const useConfigStore = defineStore('config', () => {

    const appState = reactive({
        globalConfig: {...DEFAULT_GLOBAL_CONFIG},
        reminderTasks: [],
    });
    const appStateManager = {
        globalConfigStorage: storage.defineItem(`local:reminder_global_config`, {
            init: () => ({...DEFAULT_GLOBAL_CONFIG})//不存在则创建并存储
        }),
        saveGlobalConfig: async () => {
            await appStateManager.globalConfigStorage.setValue(appState.globalConfig)
        },
        unwatchGlobalConfig: storage.watch('local:reminder_global_config', async (newValue, oldValue) => {
            appState.globalConfig = await appStateManager.globalConfigStorage.getValue()
            console.log('全局配置变化', appState.globalConfig);
        }),
        reminderTasksStorage: storage.defineItem(`local:reminder_tasks`, {
            // fallback: DEFAULT_GLOBAL_CONFIG //不存在则创建并存储
        }),
        reminderTasks: [],
        saveReminderTasks: async () => {
            await appStateManager.reminderTasksStorage.setValue(appState.reminderTasks)
        }
    }

    async function initAppState() {
        appState.globalConfig = await appStateManager.globalConfigStorage.getValue()
        appState.reminderTasks = (await appStateManager.reminderTasksStorage.getValue()) ?? []
    }

    async function persistGlobalConfig() {
        await appStateManager.saveGlobalConfig(); //保存
        browser.runtime.sendMessage({type: 'change'}); //通知background重启
    }

    const notifyBackgroundScript = async () => {
        await browser.runtime.sendMessage({
            action: 'hello',
            payload: '我是来自popup的消息',
        });
    };
    onMounted(async () => {
        await initAppState()
    })

    return {
        appState,
        appStateManager,
        persistGlobalConfig,
        notifyBackgroundScript,
    };
});
