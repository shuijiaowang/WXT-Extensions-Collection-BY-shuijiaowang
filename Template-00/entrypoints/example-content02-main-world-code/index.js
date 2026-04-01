// entrypoints/example-main-world.ts（主环境脚本，unlisted 类型）
import { defineUnlistedScript } from '#imports';


export default defineUnlistedScript(() => {
    console.log('【里世界】运行在主环境，可访问网页全局变量');
    console.log('【里世界】网页标题，document.title：', document.title);
    console.log('【里世界】隔离环境传递的问候：', document.currentScript?.dataset.greeting);
    // 监听自定义事件，获取隔离环境传递的参数
    window.addEventListener('fromIsolatedWorld', (event) => {
        if (event instanceof CustomEvent) {
            console.log('【里世界】通过事件监听，获取隔离环境传递的问候：', event.detail.greeting);
        }
    });
});