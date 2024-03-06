// for api calls

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        const { text } = msg

        // run api to fetch info here

        const data = `res response for: ${text}` // data should be the res data from the api call
        port.postMessage(data)
    })
})