import './style.css';
export default defineContentScript({
    matches: ['*://*.example.com/*'],
    runAt: "document_end",
    allFrames: false,
    cssInjectionMode: 'ui',

    async main(ctx) {

        console.log("【内容脚本】：DOM 已就绪，开始创建 Shadow Root UI");

        // 🔴 步骤1：先在主文档上监听一个自定义事件/点击事件（用于演示不隔离事件）
        document.body.addEventListener('click', (e) => {
            console.log("【主文档】：监听到点击事件", e.target);
            // 区分是否是 Shadow DOM 内部的元素触发
            if (e.composedPath().some((node) => node?.id === 'shadow-btn')) {
                console.log("【主文档】：识别到该点击来自 Shadow DOM 内部的按钮（不隔离事件生效）");
            }
        });

        // 🔴 步骤2：创建 Shadow Root UI（演示 isolateEvents: false）
        const ui = await createShadowRootUi(ctx, {
            name: 'example-shadow-ui', // 唯一标识（用于 Shadow Root 命名）
            position: 'inline',
            anchor: 'body', // 挂载到 body 上（此时 DOM 已就绪，不会报错）
            isolateEvents: false, // 不隔离事件：Shadow DOM 内部事件可冒泡到主文档
            onMount: (container) => {
                // 定义 UI 内容：一个标题 + 一个按钮（用于演示事件冒泡）
                const appTitle = document.createElement('h1');
                appTitle.textContent = '这是 Shadow Root UI（样式隔离，事件可选择是否隔离）';

                const demoBtn = document.createElement('button');
                demoBtn.id = 'shadow-btn';
                demoBtn.textContent = '点击我（演示事件不隔离）';
                demoBtn.style.padding = '8px 16px';
                demoBtn.style.marginTop = '10px';

                // Shadow DOM 内部给按钮绑定点击事件
                demoBtn.addEventListener('click', (e) => {
                    console.log("【Shadow DOM 内部】：按钮被点击了");
                    // e.stopPropagation(); // 若取消注释，主文档将无法监听到该事件（阻止冒泡）
                });

                // 挂载 UI 元素到 Shadow Root 容器
                container.append(appTitle, demoBtn);
            },
        });

        // 🔴 步骤3：挂载 UI 到页面
        ui.mount();
        console.log("【内容脚本】：Shadow Root UI 已成功挂载");
    }
});