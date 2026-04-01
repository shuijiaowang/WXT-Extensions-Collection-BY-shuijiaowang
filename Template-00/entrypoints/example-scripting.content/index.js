
export default defineContentScript({
    registration: 'runtime', // 关键配置：标记为「运行时手动触发」，而非自动注入
    main(ctx) {
        console.log('【ExampleScriptingBackground】Script was executed!'); // 执行具体业务逻辑（这里只是打印日志）
        return 'Hello John!'; // 关键：返回一个值，这个值会被 Background 脚本的 res 接收
    },
});