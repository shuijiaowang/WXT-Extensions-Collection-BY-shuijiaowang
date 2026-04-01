/**
 * 极简按键序列监听（修复长按触发问题）
 * @param {string[]} keys - 按键序列数组
 * @param {Function} callback - 序列匹配回调
 * @param {Object} [options={}] - 配置项
 * @param {number} [options.timeout=1000] - 超时时间（ms）
 * @param {HTMLElement} [options.element=document] - 绑定元素
 * @param {boolean} [options.stopPropagation=false] - 阻止冒泡（仅匹配时生效）
 * @param {boolean} [options.preventDefault=false] - 阻止默认行为（仅匹配时生效）
 * @returns {Function} 取消监听函数
 */
export const listenKeySequence = (keys, callback, options = {}) => {
    // 默认配置
    const {
        timeout = 1000,
        element = document,
        stopPropagation = false,
        preventDefault = false
    } = options;

    // 状态管理
    let currentMatchIndex = 0;
    let timeoutTimer = null;
    let lastKeyDownKey = null; // 记录上一次触发keydown的按键

    // 按键匹配（兼容key/code）
    const isKeyMatch = (e, targetKey) => e.key === targetKey || e.code === targetKey;

    // 重置状态
    const resetMatchState = () => {
        clearTimeout(timeoutTimer);
        currentMatchIndex = 0;
        lastKeyDownKey = null;
    };

    // 核心按键处理
    const handleKeyDown = (e) => {
        // ✅ 核心修复：长按自动重复的keydown，直接忽略（必须松开再按才算）
        if (lastKeyDownKey === e.code || lastKeyDownKey === e.key) {
            return;
        }

        // 记录当前按键
        lastKeyDownKey = e.key || e.code;

        // 仅当当前按键匹配序列中的对应位置时，才进行后续处理
        const isCurrentKeyMatch = isKeyMatch(e, keys[currentMatchIndex]);

        if (isCurrentKeyMatch) {
            currentMatchIndex++;
            clearTimeout(timeoutTimer);

            // 序列完全匹配时执行回调
            if (currentMatchIndex === keys.length) {
                if (stopPropagation) e.stopPropagation();
                if (preventDefault) e.preventDefault();

                callback(e);
                resetMatchState();
                return;
            }

            // 设置超时重置
            timeoutTimer = setTimeout(resetMatchState, timeout);
        } else {
            // 不匹配时重置
            resetMatchState();
        }
    };

    // ✅ 监听keyup，松开后清除锁定，允许再次按下
    const handleKeyUp = (e) => {
        if ((e.key === lastKeyDownKey || e.code === lastKeyDownKey)) {
            lastKeyDownKey = null;
        }
    };

    // 绑定事件
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);

    // 返回取消监听
    return () => {
        resetMatchState();
        element.removeEventListener('keydown', handleKeyDown);
        element.removeEventListener('keyup', handleKeyUp);
    };
};