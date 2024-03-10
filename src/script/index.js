document.addEventListener("DOMContentLoaded", async () => {
    const getActiveTab = async () => {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        })
        return tabs[0]
    }
    const activeTab = await getActiveTab()

    function handleResponseOnExtension(res) {
        // TODO: handle response data here
        // visualize/show/print
        document.getElementById("editor-output").innerHTML = res
    }

    const getData = async (selection) => {
        if (!selection?.length == 0) {
            document.getElementById("editor-output").innerHTML = "Loading..."

            const port = chrome.runtime.connect();
            port.postMessage({ text: selection })
            port.onMessage.addListener((res) => {
                handleResponseOnExtension(res)
            })
        } else {
            // if no text is selected
            // TODO: replace with some default styling
            document.getElementById("editor-output").innerHTML = "You have to first select some text"
        }
    }

    const getSelectedText = async () => {
        // Chrome does not allow injection of service workers for chrome internal pages
        // this condition returns early on chrome default pages avoiding errors
        if (/^chrome:\/\//.test(activeTab.url)) {
            document.getElementById("editor-output").innerHTML = `This extension does not work for <a href=${'https://winaero.com/the-list-of-chrome-urls-for-internal-built-in-pages/'} target='_blank'>chrome internal pages</a>.`
            return;
        }

        chrome.tabs.sendMessage(activeTab.id, { type: "LOAD" }, getData)
    }

    function launch() {
        let user = window.localStorage.getItem("user")

        if(/^http:\/\/localhost:5173/.test(activeTab.url)) {
            setInterval(()=>{
                chrome.tabs.sendMessage(activeTab.id, { type: "AUTH" }, (res)=>{
                    if(res.success) {
                        localStorage.setItem("user", res.data)
                    } else {
                        localStorage.removeItem("user")
                    }
                })
            }, 1000)
        }

        if(!user) {
            document.getElementById("auth").classList.remove('hide')

            const loginBttn = document.querySelector('button[title=login]')
            const signupBttn = document.querySelector('button[title=signup]')
            
            loginBttn.addEventListener('click', function() {
                window.open('localhost:5173?fromExtension=true', "_blank")
            })
            signupBttn.addEventListener('click', function() {
                window.open('localhost:5173?fromExtension=true', "_blank")
            })

        } else {
            document.getElementById("auth").classList.add('hide')
            getSelectedText()
        }
    }

    launch()

})