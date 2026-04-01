(async function() {
    // ================= 配置区 =================
    const SELECTOR = '[data-testid="chat_input_input"]';
    const INPUT_TEXT = '测试';
    // =========================================

    // 辅助函数：随机延迟
    const sleep = (ms) => new Promise(r => setTimeout(r, ms + Math.random() * 50));

    // 1. 获取元素
    const el = document.querySelector(SELECTOR);
    if (!el) {
        console.error('❌ 未找到元素，请检查选择器');
        return;
    }
    console.log('✅ 找到元素:', el);

    // 2. 模拟真实点击（聚焦）
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // 触发完整的指针事件流
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y }));
    await sleep(80);
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: x, clientY: y }));
    await sleep(50);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));

    // 强制聚焦
    el.focus();
    await sleep(200);

    // 3. 模拟输入文字（兼容中英文，暴力破解框架拦截）
    // 3.1 保存原生的 value setter (用于绕过 React/Vue 的拦截)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
    )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    )?.set;

    // 3.2 模拟中文输入的 Composition 事件流 (更真实)
    el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    await sleep(100);

    // 3.3 强制设置值
    nativeInputValueSetter.call(el, INPUT_TEXT);

    // 3.4 触发 compositionend 和 input 事件 (让框架感知到变化)
    el.dispatchEvent(new CompositionEvent('compositionupdate', { bubbles: true, data: INPUT_TEXT }));
    await sleep(50);
    el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: INPUT_TEXT }));

    // 3.5 触发最原始的 input 事件
    el.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: INPUT_TEXT
    }));

    await sleep(300);

    // 4. 模拟按下回车键
    // 触发完整的键盘事件流
    const enterKeyOpts = {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13
    };

    el.dispatchEvent(new KeyboardEvent('keydown', enterKeyOpts));
    await sleep(10);
    el.dispatchEvent(new KeyboardEvent('keypress', enterKeyOpts));
    await sleep(10);
    el.dispatchEvent(new KeyboardEvent('keyup', enterKeyOpts));

    // 有些聊天框监听的是 form 的 submit，尝试触发一下
    if (el.form) {
        el.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }

    console.log('✅ 操作完成');
})();

