// test for extensions working

BACKEND_URI = `https://gorest.co.in/public/v2/users`

async function get() {
    const url = BACKEND_URI;
    const options = {
        method: 'GET',
        headers: {}
    };

    let result;

    try {
        const response = await fetch(url, options);
        result = await response.json();
        console.log(result);
    } catch (error) {
        console.error(error);
    }

    document.getElementById('editor-output').innerHTML = result.map((item, idx) => {
        return `<li>${item.name}</li>`
    }).join('')
}

get()