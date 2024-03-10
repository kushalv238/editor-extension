// for api calls
// BACKEND_URI = `https://jayneet639.pythonanywhere.com`
BACKEND_URI = `http://127.0.0.1:8000`

async function postData(user, selectedText) {
    const url = `${BACKEND_URI}/users/`;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: user, doc_name: "extension-doc", data: { content: selectedText } })
    };

    let data;

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        data = { success: true, data: result }

        console.log(result);
    } catch (error) {
        console.error(error);
        data = { success: false, data: error }
    }

    return data
}

async function getVersionedData(user) {
    const url = `${BACKEND_URI}/users/${user}`;

    const options = {
        method: 'GET',
        headers: {}
    };

    let data;

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        const versions = result[0].versions

        data = { success: true, data: versions[versions.length-1] }

        console.log(result);
    } catch (error) {
        console.error(error);
        data = { success: false, data: error }
    }

    return data
}

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(async (msg) => {
        const { user, selectedText } = msg

        // TODO: run api to fetch info here
        const postedData = await postData(user, selectedText)
        if(!postedData.success) {
            port.postMessage(postedData)
            return
        }
        
        const selectedData = await getVersionedData(user)
        
        port.postMessage(selectedData)
    })
})