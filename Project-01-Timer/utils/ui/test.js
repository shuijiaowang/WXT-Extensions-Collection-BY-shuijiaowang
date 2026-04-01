function getTextareaStyleInfo(textarea) {
    // 要遍历获取的属性列表
    const props = [
        'line-height',
        'font-size',
        'height',
        'width',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'border-top-width',
        'border-bottom-width'
    ];

    const computed = window.getComputedStyle(textarea);
    const result = {};

    // 遍历获取 → 转数字
    props.forEach(prop => {
        const value = parseFloat(computed.getPropertyValue(prop)) || 0;
        result[prop] = value;
    });

    // 自动打印
    console.log('📋 textarea 真实样式信息：', result);

    return result;
}

const el = document.querySelector('[data-testid="chat_input_input"]');
getTextareaStyleInfo(el)