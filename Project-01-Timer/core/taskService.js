import {generateId} from "./utils.js";
import {appState} from "./config.js";


/**
 * 通用创建任务（底层方法）
 */
async function createBaseTask(payload) {
    const task = {
        id: generateId(),
        name: payload.name,
        type: payload.type,
        isTemplate: payload.isTemplate ?? false,
        status: 'idle',
        createdAt: Date.now(),
        updatedAt: Date.now(),

        config: {
            requireInteraction: true,
            silent: false,
            ...payload.config,
        },

        // remindRules: payload.remindRules ?? [
        //     { type: 'start', enabled: true }, //这啥，开始时一定要提醒吗，但是我希望这个提醒时临时的不用手动点击的？那也不对
        // ],
        remindRules: payload.remindRules,

        statistics: {
            totalExecSeconds: 0,
            completeCount: 0,
            lastExecTime: null,
            totalFinishCount: 0,
        },

        // 类型专属配置
        ...(payload.countdown && { countdown: payload.countdown }),
        ...(payload.timer && { timer: payload.timer }),
        ...(payload.cycle && { cycle: payload.cycle }),
        ...(payload.queue && { queue: payload.queue }),
    }

    appState.reminderTasks.push(task)
    await appState.saveReminderTasks()
    return task
}


/**
 * 添加倒计时任务
 * @param {string} name 任务名
 * @param {number} totalSeconds 总秒数
 * @param {object} options 可选配置 { remindRules, config }
 */
export async function addCountdownTask(name, totalSeconds, options = {}) {
    return createBaseTask({
        name,
        type: 'countdown',
        remindRules: options.remindRules,
        config: options.config,
        countdown: {
            totalSeconds,
            runtime: {
                remainingSeconds: totalSeconds,
                startTime: null,
                endTime: null,
            },
        },
    })
}

/**
 * 添加定时任务
 * @param {string} name
 * @param {string} targetTime '2026-04-02 08:00:00'
 * @param {object} repeat { enabled, mode, weeks }
 * @param {object} options
 */
export async function addTimerTask(name, targetTime, repeat = {}, options = {}) {
    return createBaseTask({
        name,
        type: 'timer',
        remindRules: options.remindRules,
        config: options.config,
        timer: {
            targetTime,
            repeat: {
                enabled: false,
                mode: 'once',
                weeks: [],
                ...repeat,
            },
        },
    })
}