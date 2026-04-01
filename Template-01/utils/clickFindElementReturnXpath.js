/**
 * 一次性监听点击事件，返回最近的指定类型元素的 XPath 路径
 * 执行逻辑：监听点击 → 找最近指定元素 → 高亮提示 → 返回XPath → 立即取消监听（仅触发一次）
 * @param {Object} [options] 可选配置
 * @param {string} [options.selector='textarea'] 目标元素的CSS选择器（支持任意合法选择器：tag/class/id/属性等）
 * @param {string} [options.highlightColor='#ff4444'] 高亮边框颜色
 * @param {number} [options.highlightDuration=1500] 高亮持续时间（毫秒）
 * @returns {Promise<string>} 最近元素的XPath路径，无则返回空字符串
 */
export function getNearestElementXPathOnce(options = {}) {
    // 默认配置：兼容原有textarea逻辑，同时支持自定义元素
    const config = {
        selector: 'textarea',       // 默认查找textarea，可传任意CSS选择器（如'input'/'button'/.class/#id等）
        highlightColor: '#ff4444',  // 高亮边框颜色
        highlightDuration: 1500,    // 高亮持续时间（毫秒）
        ...options
    };

    return new Promise((resolve) => {
        // 辅助方法：生成元素的XPath路径
        const getElementXPath = (element) => {
            if (!element || element.nodeType !== 1) return '';
            // 有id直接返回id的XPath（更简洁稳定）
            if (element.id) return `//*[@id="${element.id}"]`;
            // 根节点特殊处理
            if (element === document.body) return '/html/body';

            let ix = 0;
            const siblings = element.parentNode.childNodes;
            // 遍历兄弟节点计算索引
            for (let i = 0; i < siblings.length; i++) {
                const sibling = siblings[i];
                if (sibling === element) {
                    // 递归获取父节点XPath + 当前节点标签+索引
                    return `${getElementXPath(element.parentNode)}/${element.tagName.toLowerCase()}[${ix + 1}]`;
                }
                // 只统计同标签的兄弟节点
                if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                    ix++;
                }
            }
            return '';
        };

        // 辅助方法：高亮元素并自动恢复
        const highlightElement = (element) => {
            if (!element) return;
            // 保存元素原有样式，避免覆盖
            const originalBorder = element.style.border;
            const originalBoxShadow = element.style.boxShadow;

            // 设置高亮样式（边框+阴影，更醒目）
            element.style.border = `2px solid ${config.highlightColor}`;
            element.style.boxShadow = `0 0 8px rgba(${hexToRgb(config.highlightColor).join(',')}, 0.6)`;

            // 定时恢复原有样式
            setTimeout(() => {
                element.style.border = originalBorder;
                element.style.boxShadow = originalBoxShadow;
            }, config.highlightDuration);
        };

        // 辅助方法：16进制颜色转RGB（用于阴影透明度）
        const hexToRgb = (hex) => {
            // 去除#号，处理简写（如#f00 → #ff0000）
            const cleanHex = hex.replace(/^#/, '');
            const fullHex = cleanHex.length === 3
                ? cleanHex.split('').map(c => c + c).join('')
                : cleanHex;
            // 解析RGB
            return [
                parseInt(fullHex.substring(0, 2), 16),
                parseInt(fullHex.substring(2, 4), 16),
                parseInt(fullHex.substring(4, 6), 16)
            ];
        };

        // 核心方法：查找最近的指定元素
        const getNearestElement = (e) => {
            const clickX = e.clientX;
            const clickY = e.clientY;
            // 根据传入的CSS选择器查找所有目标元素
            const allElements = document.querySelectorAll(config.selector);
            if (allElements.length === 0) return null;

            let nearestElement = null;
            let minDistance = Infinity;

            allElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const elemCenterX = rect.left + rect.width / 2;
                const elemCenterY = rect.top + rect.height / 2;
                const distance = Math.hypot(elemCenterX - clickX, elemCenterY - clickY);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestElement = element;
                }
            });

            return nearestElement;
        };

        // 点击事件处理函数（仅执行一次）
        const handleClick = (e) => {
            // 1. 立即移除监听（保证一次性）
            document.removeEventListener('click', handleClick);

            // 2. 查找最近的指定元素
            const nearestElement = getNearestElement(e);

            // 3. 高亮提示（找到元素才高亮）
            highlightElement(nearestElement);

            // 4. 生成XPath路径（无则返回空字符串）
            const xpath = nearestElement ? getElementXPath(nearestElement) : '';

            // 5. 返回结果
            resolve(xpath);
        };

        // 绑定一次性点击监听
        document.addEventListener('click', handleClick);
    });
}



// 调用示例（按需选择）
// findTextarea();   // 原textarea需求
// findButton();     // 查找button
// findCustomInput();// 查找自定义input
// findContentDiv(); // 查找指定id的div