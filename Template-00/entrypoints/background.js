import {storage} from "#imports";
import AutoOpenBackgroundDevtools from "../utils/devtools/Chrome_AutoOpenBackgroundDevtools.js";
import ExampleMessingBackground from "./example-messing.content/background.js";
import ExampleScriptingBackground from "./example-scripting.content/background.js";

export default defineBackground(async () => {
    console.log('Background script started', {id: browser.runtime.id});
    const currentValue = await counter.getValue();
    await counter.setValue(currentValue + 1);
    await setBackgroundJS();
});

//存储
const counter = storage.defineItem('local:counter', {
    fallback: 0,
});

//统一注册,初始化，监听时间，逻辑处理
async function setBackgroundJS() {

    await AutoOpenBackgroundDevtools();// 扩展启动后，只执行一次：自动打开 Service Worker 控制台
    await ExampleMessingBackground(); //消息传递的例子
    await ExampleScriptingBackground();//手动注入content的例子
}
