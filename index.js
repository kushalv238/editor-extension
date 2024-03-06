document.addEventListener("DOMContentLoaded", async () => {
    const getActiveTab = async () => {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        })
        return tabs[0]
    }

    function handleResponseOnExtension(res) {
        // handle response data here
        // visualize/show/print
        document.getElementById("editor-output").innerHTML = res
    }

    const getData = async (selection) => {
        if (!selection?.length == 0)  {
            document.getElementById("editor-output").innerHTML = "Loading..."
            
            const port = chrome.runtime.connect();
            port.postMessage({text: selection})
            port.onMessage.addListener((res)=>{
                handleResponseOnExtension(res)
            })
        } else {
            // if no text is selected
            // TODO: replace with some default styling
            document.getElementById("editor-output").innerHTML = "You have to first select some text"
        }
    }

    const getSelectedText = async () => {
        const activeTab = await getActiveTab()

        // Chrome does not allow injection of service workers for chrome internal pages
        // this condition returns early on chrome default pages avoiding errors
        if(/^chrome:\/\//.test(activeTab.url)) {
            document.getElementById("editor-output").innerHTML = `This extension does not work for <a href=${'https://winaero.com/the-list-of-chrome-urls-for-internal-built-in-pages/'} target='_blank'>chrome internal pages</a>.`
            return;
        }

        chrome.tabs.sendMessage(activeTab.id, { type: "LOAD" }, getData)
    }

    getSelectedText()
})