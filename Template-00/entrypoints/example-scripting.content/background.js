export async function ExampleScriptingBackground() {

    setTimeout(async () => {
        const [tab] = await browser.tabs.query({url: "https://www.example.com/"});
        if (!tab.id) return;

        const res = await browser.scripting.executeScript({
            target: {tabId: tab.id}, // 关键：指定要在哪个标签页执行脚本（tabId 是标签页的唯一标识）
            files: ['content-scripts/example_scripting.js'], // 关键：指定要执行的 Content 脚本文件路径
        });
        console.log("【ExampleScriptingBackground】",res); // "Hello John!"  // 接收 Content 脚本返回的结果
    },5000)

}

export default ExampleScriptingBackground;