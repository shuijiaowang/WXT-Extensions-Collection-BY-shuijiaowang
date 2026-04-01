import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import {appState as externalAppState, DEFAULT_DOMAIN_CONFIG} from '../core/config.js';
import * as domain from "node:domain";
export const useConfigStore = defineStore('config', () => {

    // 标签页等，获取url，域名等相关信息
    // 激活标签页
    const activeTab = ref(null)
    // 标签页相关信息（统一管理）
    const tabInfo = reactive({
        url: '',
        domain: '',
        title: '',
        favIcon: ''
    })
    // 获取当前标签页
    const initActiveTab = async () => {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
            activeTab.value = tab
            return tab
        } catch (err) {
            console.error('获取标签失败', err)
            return null
        }
    }
    // 解析信息（统一更新 tabInfo）
    const resolveTabInfo = (tab) => {
        if (!tab?.url) {
            tabInfo.domain = '无法识别'
            return
        }

        const { hostname } = new URL(tab.url)
        tabInfo.url = tab.url
        tabInfo.domain = hostname
        tabInfo.title = tab.title || ''
        tabInfo.favIcon = tab.favIconUrl || ''
    }
    //popup页面的全局状态
    const appState = externalAppState;
    //
    const initAppState=()=>{
        appState.activeTab=activeTab
        appState.domainConfigStorage=storage.defineItem(`local:${tabInfo.domain}`, {
            fallback: DEFAULT_DOMAIN_CONFIG //不存在则创建并存储
        })
        appState.domainConfig=appState.domainConfigStorage.getValue()
    }
    // 一键初始化
    const initAll = async () => {
        const tab = await initActiveTab()
        tab && resolveTabInfo(tab)
        initAppState()
    }
    onMounted(async () => {
        await initAll()
    })

    //消息通信
    const notifyContentScript = async (type) => {
        if (!activeTab.value?.id) return;
        //'PLUGIN_TOGGLE'
        await browser.tabs.sendMessage(activeTab.value.id, {type: type});
    };
    const notifyBackgroundScript = async (type) => {
        //'PLUGIN_TOGGLE'
        await browser.runtime.sendMessage({
            action: 'hello',       // 自定义类型，方便区分
            payload: '我是来自popup的消息'
        });
    };

    // 统一导出
    return {
        activeTab,
        tabInfo,
        appState,
        initAll,
        notifyContentScript,
        notifyBackgroundScript
    }
})