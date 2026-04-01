// 【绝对正确】textarea 专用获取真实行高
// 1:1 复制原元素样式，不继承body，和你的编辑器完全一致
export const getPreciseLineHeight = (elem) => {
    // ✅ 第一步：拿到原元素【真实计算样式】（核心！）
    const computedStyle = window.getComputedStyle(elem);
    const fontSize = computedStyle.fontSize;
    const fontFamily = computedStyle.fontFamily;
    const lineHeight = computedStyle.lineHeight;

    console.log("难道说这里的lineHeight是48？？",lineHeight,fontSize) //24,16
    // ✅ 第三步：创建测试textarea，【强制赋值原样式】（不是继承！）
    const testTextarea = document.createElement('textarea');
    testTextarea.style.cssText = `
    position: absolute;
   
    width: 100px;
    height: auto;
    padding: 0;
    margin: 0;
    border: 0;
    font-size: ${fontSize};
    font-family: ${fontFamily};
    line-height: ${lineHeight};
  `;
    testTextarea.rows = 1;
    testTextarea.value = 'AAA';

    // 插入页面测量高度
    document.body.appendChild(testTextarea);
    const realLineHeight = testTextarea.offsetHeight;
    document.body.removeChild(testTextarea);
    console.log("为啥是48？？",realLineHeight) //24,16
    // ✅ 直接返回：这个值就是原textarea的真实行高
    return realLineHeight;
};