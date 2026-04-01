export default defineContentScript({
  matches: ['*://*.baidu.com/*'],
  main() {
    console.log('Hello content.');
  },
});
