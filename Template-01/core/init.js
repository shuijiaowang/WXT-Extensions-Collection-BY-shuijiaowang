import {appState} from "./config.js";

export async function init() {

    appState.domainConfig = await appState.domainConfigStorage.getValue()
    //查询判断该网页是否启用插件，默认是关闭的,需要从popup中启用
    if (!appState.domainConfig.isPluginEnabled) {
        return;
    }
}