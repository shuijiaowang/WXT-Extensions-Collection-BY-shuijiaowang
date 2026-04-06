// core/countdown.js

import { appState } from "./config";
import { createBaseTask } from "./taskService";
import { generateId } from "./utils";

//创建倒计时任务
export async function createCountdownTask(name, totalSeconds, options = {}) {
    const task = {
        id: generateId(),
        name: name,
        type: 'countdown',
        status: 'idle',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        config: options.config,

        totalSeconds, //总时长

        remainingSeconds: totalSeconds, // 初始时默认剩余时间等于总时长
        startTime: null, //开始时间
        targetTime: null,//触发时间
        endTime: null,//结束时间

        remindRules: options.remindRules,
        statistics: {
            totalExecSeconds: 0,
            completeCount: 0,
            lastExecTime: null,
            totalFinishCount: 0,
        },
    }
    appState.reminderTasks.push(task)
    await appState.saveReminderTasks()
    return task
}

//传参，
function GetRemindRuleTargetSeconds(remindRules, Seconds) {
    // 存储所有【有效】计算出的提醒触发秒数
    const validRemindSeconds = [];

    // 遍历所有提醒规则
    for (const rule of remindRules) {
        // 第一步：跳过未启用的规则
        if (!rule.enabled) continue;

        let triggerSecond;
        // 第二步：根据规则类型计算触发时间
        switch (rule.type) {
            case "progress":
                // 进度规则：总秒数 * 进度百分比（如75% → Seconds * 0.75）
                triggerSecond = Seconds * (rule.value / 100);
                validRemindSeconds.push(triggerSecond);
                break;

            case "remaining":
                // 剩余时间规则：总秒数 - 设定剩余值，必须大于0才有效
                triggerSecond = Seconds - rule.value;
                if (triggerSecond > 0) {
                    validRemindSeconds.push(triggerSecond);
                }
                break;

            // 忽略未知类型的规则
            default:
                break;
        }
    }

    // 第三步：返回最小值，无有效数据返回0
    return validRemindSeconds.length > 0
        ? Math.min(...validRemindSeconds)
        : 0;
}
function updateCountdownTargentTime(task,nowTs = Date.now()){
    let remindRules = task.remindRules??appState.globalConfig.remindRules
    let diff = 0
    if (remindRules) {
        diff = GetRemindRuleTargetSeconds(remindRules, task.totalSeconds) - task.remainingSeconds
        if (diff < 0) diff = 0;
    }
    if (diff) {
        return nowTs + diff*1000
    } else {
        return task.endTime
    }
}


//启动,记录开始事件，更新状态，计算触发时间
export function startCountdownTask(task, nowTs = Date.now()) {
    if (task.type !== 'countdown') return;
    if (task.status !== 'idle') return;

    // 首次启动：如果 remainingSeconds 没填，就用 totalSeconds
    if (task.remainingSeconds == null && task.totalSeconds != null) {
        task.remainingSeconds = task.totalSeconds;
    }

    task.status = 'running';
    console.log("这里为啥不修改为“running？？")
    task.startTime = nowTs;
    task.endTime = nowTs + (task.remainingSeconds ?? 0) * 1000;
    task.targetTime=updateCountdownTargentTime(task, nowTs = Date.now())
    
    task.updatedAt = nowTs;
}
//暂停，修改状态，计算剩余时间
export function pauseCountdownTask(task, nowTs = Date.now()) {
    if (task.type !== 'countdown') return;
    if (task.status !== 'running') return;

    //计算剩余时间
    const remainingMs = Math.max(0, task.endTime - nowTs);
    task.remainingSeconds = Math.round(remainingMs / 1000);
    task.status = 'paused';
    task.targetTime = null;
    task.endTime = null;
    task.updatedAt = nowTs;
}
//继续
export function resumeCountdownTask(task, nowTs = Date.now()) {
    if (task.type !== 'countdown') return;
    if (task.status !== 'paused') return;

    task.status = 'running';

    //这个跟启动的计算是一样的，只是不记录开始时间。
    task.endTime = nowTs + (task.remainingSeconds ?? 0) * 1000;
    task.targetTime=updateCountdownTargentTime(task, nowTs = Date.now())
    task.updatedAt = nowTs;
}
//结束
export function finishCountdownTask(task, nowTs = Date.now()) {
    if (task.type !== 'countdown') return;

    task.status = 'finished';

    // 结束时刻记录下来，方便展示/统计
    task.endTime = nowTs;
    task.targetTime = null;

    task.updatedAt = nowTs;

    task.statistics.totalFinishCount = (task.statistics.totalFinishCount || 0) + 1;
    task.statistics.lastExecTime = nowTs;
    task.statistics.totalExecSeconds = (task.statistics.totalExecSeconds || 0) + task.totalSeconds-task.remainingSeconds
    task.remainingSeconds = 0;
}

//追加或减少倒计时的时间，也就是