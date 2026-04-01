import {defineConfig} from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-vue','@wxt-dev/i18n/module'],
    manifest: {
        //https://developer.chrome.com/docs/extensions/reference/permissions-list?hl=zh-cn //包括哪些权限
        permissions: ['storage','activeTab', 'webRequest', "debugger", "commands", "tabs","notifications"],
        default_locale: 'zh_CN', // 默认语言为英语
        name: '__MSG_extName__',
        description: '__MSG_extDescription__',
        web_accessible_resources: [
            {
                // 允许访问该 HTML 的目标网页（与内容脚本 matches 一致）
                matches: ['https://www.example.com/*'],
                // 声明 IFrame HTML 页面（根路径访问）
                resources: ['/example-ui-iframe.html'],
            },
            {
                matches: ['https://www.example.com/*'],
                resources: ['/man.jpg'],
            },
            {
                matches: ['<all_urls>'],
                resources: ['example-content02-main-world.js'], // 声明主环境脚本可被访问
            },
        ],
        // 关键：声明允许访问CSDN域名的主机权限，解决跨域核心前提
        host_permissions: [
            "https://blog.csdn.net/*", // 匹配所有CSDN博客文章链接
            "https://www.baidu.com/*"  // 匹配百度搜索页（可选，确保脚本正常运行）
        ]
    },
});
