/**
 * 为元素添加拖拽移动功能
 * @param {HTMLElement} targetElement - 需要拖拽的目标元素
 * @param {Function} [callback] - 拖拽结束后的回调函数，会接收最新的坐标信息 {x, y}
 * @param {Object} [options] - 可选配置项
 * @param {number} [options.hitAreaSize=20] - 左上角可触发拖拽的区域大小（px），默认20px
 */
export function makeElementDraggable(targetElement, callback, options = {}) {
    // 校验参数合法性
    if (!(targetElement instanceof HTMLElement)) {
        return;
    }

    // 默认配置
    const config = {
        hitAreaSize: 20, // 左上角拖拽触发区域大小
        ...options
    };

    // 拖拽状态变量
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // 初始化元素样式（确保元素可定位）
    if (getComputedStyle(targetElement).position === 'static') {
        targetElement.style.position = 'absolute';
    }

    /**
     * 检查鼠标是否在元素左上角的触发区域内
     * @param {MouseEvent} e - 鼠标事件对象
     * @returns {boolean} 是否在触发区域内
     */
    function isInHitArea(e) {
        const rect = targetElement.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        // 检查是否在左上角的矩形区域内（大小由hitAreaSize决定）
        return (
            mouseX >= rect.left &&
            mouseX <= rect.left + config.hitAreaSize &&
            mouseY >= rect.top &&
            mouseY <= rect.top + config.hitAreaSize
        );
    }

    /**
     * 鼠标移动事件处理
     */
    function handleMouseMove(e) {
        // 1. 非拖拽状态下，检测鼠标是否在触发区域，切换光标
        if (!isDragging) {
            targetElement.style.cursor = isInHitArea(e) ? 'move' : '';
            return;
        }

        // 2. 拖拽状态下，计算并更新元素位置
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newLeft = initialLeft + dx;
        const newTop = initialTop + dy;

        // 更新元素位置
        targetElement.style.left = `${newLeft}px`;
        targetElement.style.top = `${newTop}px`;
    }

    /**
     * 鼠标按下事件处理（开始拖拽）
     */
    function handleMouseDown(e) {
        // 只在左上角触发区域内按下才开始拖拽
        if (!isInHitArea(e)) return;

        // 阻止默认行为和事件冒泡，避免影响其他元素
        e.preventDefault();
        e.stopPropagation();

        isDragging = true;
        // 记录初始位置（鼠标位置 + 元素当前位置）
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseFloat(targetElement.style.left) || 0;
        initialTop = parseFloat(targetElement.style.top) || 0;

        // 添加全局事件监听（拖拽时需要监听整个文档的鼠标移动/松开）
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    /**
     * 鼠标松开事件处理（结束拖拽）
     */
    function handleMouseUp() {
        if (!isDragging) return;

        isDragging = false;
        targetElement.style.cursor = ''; // 恢复默认光标

        // 移除全局事件监听，避免内存泄漏
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // 执行回调函数，传递最新坐标
        if (typeof callback === 'function') {
            callback({
                x: parseFloat(targetElement.style.left) || 0,
                y: parseFloat(targetElement.style.top) || 0
            });
        }
    }

    // 为目标元素添加初始事件监听
    targetElement.addEventListener('mousedown', handleMouseDown);
    targetElement.addEventListener('mousemove', handleMouseMove);

    // 返回销毁函数，用于移除事件监听（避免内存泄漏）
    return function destroyDraggable() {
        targetElement.removeEventListener('mousedown', handleMouseDown);
        targetElement.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
}

// ---------------------- 使用示例 ----------------------
// 1. 获取目标元素
const draggableBox = document.querySelector('[data-testid="chat_input_input"]');

// 2. 定义回调函数（存储坐标）
function savePosition(coords) {
    console.log('元素最新坐标：', coords);
    // 这里可以添加存储逻辑，比如存到localStorage、发送到后端等
    localStorage.setItem('elementPosition', JSON.stringify(coords));
}

// 3. 初始化拖拽功能
const destroyDrag = makeElementDraggable(
    draggableBox,
    savePosition,
    { hitAreaSize: 30 } // 自定义左上角触发区域为30px
);

// 4. 如需移除拖拽功能（比如组件卸载时）
// destroyDrag();