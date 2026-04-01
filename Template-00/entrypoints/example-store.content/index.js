
export default defineContentScript({
    matches: ['*://*.example.com/*'],
    async main() {
        await storage.setItem("local:example", {
            "name":"example"
        });
        const example=await storage.getItem("local:example");
        console.log("【store】key:example,value:",example)

        const installDate = storage.defineItem('local:install-date', {
            init: () => new Date().getTime(),
        });
        const installDateValue = await installDate.getValue();
        console.log("【store】key:install-date, value:", installDateValue); // 输出：1（初始化的值）
    },
});