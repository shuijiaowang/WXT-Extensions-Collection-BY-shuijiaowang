// entrypoints/example.content.ts（内容脚本，负责注入）
import { defineContentScript, injectScript } from '#imports';

export default defineContentScript({
    matches: ['<all_urls>'],
    async main() {
        // 注入主环境脚本
        const { script } = await injectScript('/example-content02-main-world.js', {
            keepInDom: true, // 是否保留脚本元素在 DOM 中
            modifyScript: (script) => {
                // 可选：注入前修改脚本元素（如传递数据）
                // script.charset = 'UTF-8';  //如果出现乱码
                script.dataset.greeting = 'Hello from Isolated World';

                script.type='module' //现代规范，默认 UTF-8 解析 //但script.dataset失效，需要用事件传参
                script.addEventListener('load', () => {
                    console.log('【主世界】模块脚本加载完成，派发传参事件');
                    window.dispatchEvent(
                        new CustomEvent('fromIsolatedWorld', {
                            detail: { greeting: 'Hello from Isolated World' },
                            bubbles: true,
                            cancelable: true,
                        })
                    );
                });
            },
        });


    },
});