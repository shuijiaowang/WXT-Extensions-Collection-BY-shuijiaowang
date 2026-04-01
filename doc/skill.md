技术库使用：WXT+Vue+Js，注意使用Js。

### 项目开发
#### 个人细化的项目结构
```plain
src                               # 插件核心工程目录
├── wxt.config.ts                 # WXT核心配置（启用vue模块/声明权限）
├── components/                   # Vue组件目录
│   └── HelloWorld.vue            # 示例Vue组件（可能未实际使用）
├── core/                         # 插件核心逻辑目录
│   ├── config.js                 # 全局配置+全局状态
│   ├── 开发文档.md               # 阶段性/完整开发文档
│   ├── init.js                   # 初始化入口
│   ├── listen.js                 # 监听事件
│   ├── storageService.js         # 存储服务
│   ├── util.js                   # 工具函数等，该项目独有的
│   └── ui.js                     # UI相关的
├── entrypoints/                  # WXT入口文件目录（浏览器扩展标准）
│   ├── background.js             # 后台服务
│   ├── content.js                # 内容脚本（注入到网页，初始化）
│   └── popup/                    # 插件弹窗（Vue实现）
│       ├── App.vue               # 弹窗核心组件（开关/上传/阅读设置）
│       ├── index.html            # 弹窗HTML入口
│       ├── main.ts               # 弹窗Vue实例挂载
│       └── style.css             # 弹窗全局样式
├── utils/                        # 工具函数目录,提取一些可能被别的项目可复用的函数
│   ├── clickFindElementReturnXpath.js  # 点击获取元素XPath（定位目标输入框）
│   ├── listen/                   # 按键监听工具,
│   │   ├── listenKeyCombo.js     # 连击按键监听模版，传入回调函数
│   │   └── listenKeyOneByOen.js  # 单键/序列键监听模版，传入回调函数
│   └── ui/                       # UI工具
│       └── showToast.js          # 自动消失提示框
```

#### 全局配置和全局状态，config.js
如果匹配全网站但可自定义是否启用，在Extension storage中用域名作key存储是否启用

```javascript
// 全局配置常量
export const APP_CONFIG = {
    // 如快捷键配置
    KEYBOARD: {
        CTRL_DOUBLE_TIMEOUT: 1000,
        ...
    },
};
export const DEFAULT_DOMAIN_CONFIG = {
    isPluginEnabled: false,
    ...
};
export const appState = {
    //--------该网站独有的存储属性-------
    domainConfigStorage : storage.defineItem(`local:${window.location.hostname}`, {
        fallback: DEFAULT_DOMAIN_CONFIG //不存在则返回默认配置
    }),
    domainConfig: {
        isPluginEnabled: false, //是否启用插件
    },
    //初始化时：appState.domainConfig = await appState.domainConfigStorage.getValue()
};
```

### WXT使用
#### WXT存储基础使用
```javascript
//storageAPI是异步的，所属Extension storage，content/popup/background共享的，
//与网页的Local storage隔离
//popup有独立的Local storage
//watch监听是监听的存储变化，popup修改能被content监听，反之也成立，可以用于消息通信！

import { storage } from '#imports'; //导入
permissions: ['storage','unlimitedStorage'],//存储权限,突破存储上限权限
await storage.getItem('local:installDate'); //基础使用setItem/removeItem
// 设置监听器
const unwatch = storage.watch('local:counter', (newCount, oldCount) => {
  console.log('计数器变化:', { newCount, oldCount });
});
// 移除监听器
unwatch();
const theme = storage.defineItem('local:theme', {
  fallback: 'dark', //不存在返回默认值不存储
});
const userId = storage.defineItem('local:user-id', {
  init: () => globalThis.crypto.randomUUID(), //不存在则创建并存储
});
//可定义存储项复用,就不用每次用key
const item = storage.defineItem(
  'local:showChangelogOnUpdate',
  {
    fallback: true, // 默认值
  },
);
// 使用存储项
await item.getValue().setValue.removeValue;
const unwatch = item.watch((new,old) => {});

```

#### WXT的通信
```javascript
//popup可以独立向当前活跃的标签页发送通信。

//background/popup->content
const [tab] = await browser.tabs.query({active: true, currentWindow: true});
if (!tab.url) return;
if (!tab.id) return;
await browser.tabs.sendMessage(activeTab.value.id, {type: 'CONFIG_UPDATED'});

//监听消息
browser.runtime.onMessage.addListener(async (message) => {if (message.type === 'CONFIG_UPDATED') {}});
//发送消息并监听回复
browser.runtime.sendMessage(
    {
        type: "ADD_NUMBERS",
        payload: { a: 5, b: 3 }
    }
).then(response => {
    console.log('[Content] 收到 Background 回复:', response);
}).catch(err => {
    console.error('[Content] 发送消息失败:', err);
});
//或用await语法糖
const response = await browser.runtime.sendMessage(tab.id, {type: '', payload: {}});
//监听消息并回复sendResponse
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "ADD_NUMBERS") {
      const { a, b } = message.payload;
      // 模拟异步处理
      setTimeout(() => {
        sendResponse({ok: true,result: a + b,message: '计算完成'});
      }, 1000);
      // return true;//异步回复 Manifest V3 不需要 return true
    }
  });
```

#### 多语言
```javascript
//npm install @wxt-dev/i18n
//导入
import { i18n } from '#i18n';
const t = i18n.t; // 简化i18n调用
t.("test.test1") 
//配置
export default defineConfig({
modules: ['@wxt-dev/module-vue','@wxt-dev/i18n/module'], //虚拟模块需要导入。
manifest:{
        permissions: ['storage'],
        default_locale: 'zh_CN', // 默认语言为英语
        name: '__MSG_extName__',
        description: '__MSG_extDescription__',
},
//src/locales/zh-CN.yml
//src/locales/en.yml
extName: 
extDescription: 
test:
  test1: this is test1
  test2: this is test2
```

