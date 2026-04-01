// core/config.js
export const APP_CONFIG = {
    // 快捷键配置
    KEYBOARD: {},
    // UI配置
    UI: {}
};
// ... (保留 DEFAULT_DOMAIN_CONFIG 和 appState 其余部分) ...
export const DEFAULT_DOMAIN_CONFIG = {
    pluginEnabled: false,
};
export const appState = {
    //--------该网站独有的存储属性-------
    domainConfigStorage : storage.defineItem(`local:${window.location.hostname}`, {
        fallback: DEFAULT_DOMAIN_CONFIG //不存在则创建并存储
    }),
    domainConfig: {
        isPluginEnabled: false, //是否启用插件
    },
    saveDomainConfig:async () => {
        await appState.domainConfigStorage.setValue(appState.domainConfig)
    }
};
