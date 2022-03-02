chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get("todos", (data) => {
        console.log(data.todos);
        // let todos = [];
        // chrome.storage.sync.set({todos})
    })
})