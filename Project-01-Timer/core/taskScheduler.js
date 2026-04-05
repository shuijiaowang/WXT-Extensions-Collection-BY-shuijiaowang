import {appState} from './config.js';
import {showReminderNotification} from './reminderNotification.js';
import {finishCountdownTask, startCountdownTask} from "./countdown.js";

export function now() {
    return Date.now();
}

/**
 * 计算该任务「下一次响铃」的时间戳（ms）。当前仅支持 countdown；不参与调度的返回 null。
 */
export function getNextTriggerTs(task, nowTs) {
    if (task.type !== 'countdown') return null;
    if (task.status === 'finished' || task.status === 'disabled') return null;
    const rt = task;
    if (!rt) return null;
    if (task.status === 'running') return rt.targetTime;
    return null;
}

/**
 * 在 appState.reminderTasks 里找出「下一次响铃时间」最早的那一个，用于只设一个 alarm 时选中谁。
 * 无有效触发时间的任务会被跳过；列表为空或全部无效时返回 null。
 */
export function getNearestTriggerTask(nowTs) {
    const tasks = appState.reminderTasks;
    let best = null;
    // 用 Infinity 作初值，保证第一个有效 ts 一定会替换
    let bestTs = Infinity;
    for (const task of tasks) {
        const ts = getNextTriggerTs(task, nowTs);
        // 非 countdown / 已结束 / 无 runtime 等：不参与本轮「最近响铃」比较
        if (ts == null) continue;
        if (ts < bestTs) {
            bestTs = ts;
            best = task;
        }
    }
    // 从未命中有效 ts 时保持 null
    return best;
}

/** idle 的倒计时被调度选中时，写入 start/end，便于与 storage 一致 */
export async function ensureCountdownRunning(task) {
    startCountdownTask(task) //启动
    await appState.saveReminderTasks();
}


/** 到时回调：落库 + 通知（后续可拆出 remindRules、队列等） */
export async function handleTaskTrigger(task) {
    finishCountdownTask(task)
    await appState.saveReminderTasks();
    showReminderNotification(
        {title: `倒计时结束 · ${task.name}`, message: '时间到'},
        task.config,
    );
}
