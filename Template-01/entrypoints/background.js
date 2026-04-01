import {storage} from "#imports";
export default defineBackground(async () => {
    console.log('Background script started', {id: browser.runtime.id});
    const currentValue = await counter.getValue();
    await counter.setValue(currentValue + 1);
});
//存储
const counter = storage.defineItem('local:counter', {
    fallback: 0,
});


