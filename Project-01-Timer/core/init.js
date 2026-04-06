import {appState} from "./config.js";
import {initMessaging} from "./messaging.js";
import {createCountdownTask} from "./countdown.js";
import {ensureCountdownRunning, scheduleNextTask} from "./taskScheduler.js";

export async function init() {

    console.log('Background script started', {id: browser?.runtime?.id});
    initMessaging() //初始化所有监听
    appState.globalConfig=await  appState.globalConfigStorage.getValue()
    appState.reminderTasks = (await appState.reminderTasksStorage.getValue()) ?? []

    // setTimeout(()=>{
    //     showReminderNotification({
    //         title:"t",
    //         message:"m"
    //     },{
    //         silent:true,
    //     })
    // },3000)



    // 模拟：两个倒计时（实际应由 popup 写入后再 scheduleNextTask）
    const t1 = await createCountdownTask('测试', 10);
    const t2 = await createCountdownTask('测试2', 20);
    await ensureCountdownRunning(t1);
    await ensureCountdownRunning(t2);
    await scheduleNextTask();
}