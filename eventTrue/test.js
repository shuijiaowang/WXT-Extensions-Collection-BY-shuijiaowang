//写个监听方法，鼠标点击任意位置会计算其坐标，然后打印


//该网站使用了vue/react，但想方法无视掉它的种种，最原始的模拟触发以实现
//整理方法
//传参：el,元素，event，事件，value，值
const sleep = (ms) => new Promise(r => setTimeout(r, ms + Math.random() * 50));
async function eventTrueClick(opt) {
    const {el, value} = opt;
    if (value.count === undefined) {
        value.count = 1;
    }
    //获取坐标
    let rect = null;
    let x = 0;
    let y = 0;
    // 【修改1：统一获取「实际要点击的目标元素」】
    let targetEl = el;
    if (el === document) { //如果无法确定元素，则传入坐标
        x = value.x;
        y = value.y;
        // 关键：根据坐标找到页面上实际的元素（这是点击生效的核心）
        targetEl = document.elementFromPoint(x, y);
        // 兜底：如果坐标无元素，用body（比document更易触发交互）
        if (!targetEl) targetEl = document.body;
    } else {
        rect = el.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
    }
    //点击次数
    for (let i = 0; i < value.count; i++) {
        // 【修改2：完善事件参数，模拟真实鼠标点击】
        const eventOpts = {
            bubbles: true,
            cancelable: true, // 必须加：允许事件被取消（模拟原生点击）
            clientX: x,
            clientY: y,
            button: 0, // 0=左键（核心：指定鼠标按键，默认可能无）
            pointerType: 'mouse' // PointerEvent需指定类型为鼠标
        };
        // 触发完整的指针事件流（改为触发到实际元素targetEl）
        targetEl.dispatchEvent(new PointerEvent('pointerdown', eventOpts));
        await sleep(10);
        targetEl.dispatchEvent(new PointerEvent('pointerup', eventOpts));
        await sleep(10);
        targetEl.dispatchEvent(new MouseEvent('click', eventOpts));
        await sleep(10);
        await sleep(value.sleeptime_single ? value.sleeptime_single : 20);
        console.log("点击完成", i, x, y, "实际触发元素：", targetEl);
    }
}

// 测试调用（现在能生效）
await eventTrueClick({el:document,value: {sleeptime_single: 1000, count: 10, x: 10, y: 10}});
async function eventTrue(el, event, value = {}) {

    if (event === 'click') {
        await eventTrueClick({el, value})
    }
    if (event === 'input') {
        // 3. 模拟输入文字（兼容中英文，暴力破解框架拦截）
        // 3.1 保存原生的 value setter (用于绕过 React/Vue 的拦截)
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
        )?.set || Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        )?.set;

        // 3.2 模拟中文输入的 Composition 事件流 (更真实)
        el.dispatchEvent(new CompositionEvent('compositionstart', {bubbles: true}));
        await sleep(100);

        // 3.3 强制设置值
        const currentValue = el.value; // 获取输入框当前值
        nativeInputValueSetter.call(el, currentValue + value.input); // 拼接后赋值
        // nativeInputValueSetter.call(el, value.input);

        // 3.4 触发 compositionend 和 input 事件 (让框架感知到变化)
        el.dispatchEvent(new CompositionEvent('compositionupdate', {bubbles: true, data: value.input}));
        await sleep(50);
        el.dispatchEvent(new CompositionEvent('compositionend', {bubbles: true, data: value.input}));

        // 3.5 触发最原始的 input 事件
        el.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: value.input
        }));

        await sleep(300);
    }
    if (event === 'keyboard') {
        // 4. 模拟按下回车键
        // 触发完整的键盘事件流
        const enterKeyOpts = value

        el.dispatchEvent(new KeyboardEvent('keydown', enterKeyOpts));
        await sleep(10);
        el.dispatchEvent(new KeyboardEvent('keypress', enterKeyOpts));
        await sleep(10);
        el.dispatchEvent(new KeyboardEvent('keyup', enterKeyOpts));

        // 有些聊天框监听的是 form 的 submit，尝试触发一下
        if (el.form) {
            el.form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
        }
    }
    await sleep(value.sleeptime ? value.sleeptime : 20); //该任务的执行休眠事件
}


(async function () {
    // ================= 配置区 =================
    // 1. 获取元素
    const el = document.querySelector("#bigCookie")
    const taskList = [];
    for (let i = 0; i < 100; i++) {
        // await eventTrue(el, 'click',{count:100})
        taskList.push(eventTrue(el, 'click', {count: 100}));
    }
    const handleClick = (e) => {
        console.log('==== 鼠标点击坐标信息 ====', e.clientX, e.clientY);
    };

    // 给整个文档绑定点击事件（覆盖页面任意位置）
    document.addEventListener('click', handleClick);
    taskList.push(eventTrue(document, "click", {sleeptime_single: 1000, count: 10, x: 915, y: 304}))
    await Promise.all(taskList);
})();
(async function () {
    // ================= 配置区 =================
    const SELECTOR = '[data-testid="chat_input_input"]';
    const INPUT_TEXT = '测试';
    // 1. 获取元素
    const el = document.querySelector(SELECTOR);
    if (!el) {
        console.error('❌ 未找到元素，请检查选择器');
        return;
    }
    console.log('✅ 找到元素:', el);
    await eventTrue(el, 'click')
    await eventTrue(el, 'input', {input: "ceshi1"})
    await eventTrue(el, 'input', {input: "ceshi2"})
    const enterKeyOpts = {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13
    };
    await eventTrue(el, 'keyboard', enterKeyOpts)
})();

