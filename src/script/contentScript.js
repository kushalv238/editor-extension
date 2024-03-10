console.log("Editor litening for selected texts")

if (window.location.href.includes('essayanalyzer.netlify.app')) {
    console.log("Editor litening for auth")
}

const returnSelection = () => {
    return new Promise((resolve, reject) => {
        if (window.getSelection) {
            resolve(window.getSelection().toString())
        } else if (document.getSelection) {
            resolve(document.getSelection().toString())
        } else if (document.selection) {
            resolve(document.selection.createRange().text.toString())
        } else reject();
    })
}

const getUserInfo = () => {
    return new Promise((resolve, reject) => {
        if (window.localStorage.getItem('user')) {
            resolve(window.localStorage.getItem('user').toString())
        } else reject();
    })
}

chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    const { type } = request
    
    if (type === "LOAD") {
        try {
            const selection = await returnSelection()
            response(selection)
        } catch (e) {
            response()
        }
    }

    if (window.location.href.includes('essayanalyzer.netlify.app') && type === "AUTH") {
        try {
            const user = await getUserInfo()
            response({ success: true, message: "User info recieved", data: user })
        } catch (e) {
            response({ success: false, message: e })
        }
    }
})