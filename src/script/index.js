document.addEventListener("DOMContentLoaded", async () => {
    let user = window.localStorage.getItem("user")

    const getActiveTab = async () => {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        })
        return tabs[0]
    }
    const activeTab = await getActiveTab()

    const getHighlightColor = (length) => {
        if (length <= 5) return "#ACE986";
        if (length <= 18) return "#FFEA79";
        return "#FFB3B3";
    };
    const getTextColor = (length) => {
        if (length <= 5) return "#1A5D1A";
        if (length <= 18) return "#DE8601";
        return "#9A2617";
    };

    function getHighlightedText(sentences) {
        const highlightedText = sentences.map((sentence) => {
            const bgcolor = getHighlightColor(sentence.content.split(/\s+/).length);
            const color = getTextColor(sentence.content.split(/\s+/).length);

            return `<span
                data-key=${sentence.sentence_id}
                class="text-xs"
                style="background-color: ${bgcolor}; color: ${color}; font-weight: 600; letter-spacing: 0.025em"
            >
                ${sentence.content}
            </span>`;
        }).join('');

        return (
            `
                <h3>Selected Text</h3>
                ${highlightedText}
            `
        )
    }

    function getBrokenDownText(sentences) {
        const brokenDownText = sentences.map((sentence) => {
            const bgcolor = getHighlightColor(sentence.content.split(/\s+/).length);
            const color = getTextColor(sentence.content.split(/\s+/).length);

            return `<div
                data-key=${sentence.sentence_id}
                class="text-xs"
                style="background-color: ${bgcolor}; color: ${color}; border-radius: 0.2rem; padding: 0.5rem; font-weight: 600; letter-spacing: 0.025em"
            >
                ${sentence.content}
            </div>`
        }).join('')

        return (
            `
                <h3>Breakdown</h3>
                ${brokenDownText}
            `
        )
    }

    function getBrokenDownCount(sentences) {
        const brokenDownCount = sentences.map((sentence) => {
            const length = sentence.content.split(/\s+/).length
            const color = getTextColor(length)
            return (
                `<span
                        data-key=${sentence.sentence_id}
                        style="color: ${color}"
                        class="flexed-center"
                    >
                        ${length}
                    </span>`
            )
        }).join(',&nbsp;')

        return (
            `
                <h3>Breakdown count:&nbsp;</h3>
                ${brokenDownCount}
            `
        )
    }

    const calculateSentenceRhythm = (sentence) => {
        const wordsCount = sentence.split(/\s+/).length;
        if (wordsCount <= 5) return "S";
        if (wordsCount <= 18) return "M";
        return "L";
    };

    function getRhythm(sentences) {
        const rhythm = sentences.map((sentence) => {
            const rhythm = calculateSentenceRhythm(sentence.content);
            const color = getTextColor(sentence.content.split(/\s+/).length)
            return (
                `<span
                        data-key=${sentence.sentence_id}
                        style="color: ${color}"
                        class="flexed-center"
                    >
                        ${rhythm}
                    </span>`
            );
        }).join(',&nbsp;')

        return (
            `
                <h3>Rhythm:&nbsp;</h3>
                ${rhythm}
            `
        )
    }

    function getStatistics(sentences) {
        return (
            `
            <h3>Statistics</h3>
            <div class="flexed-wrap flexed-away">
                <div style="color: #1A5D1A" class="flexed-center">
                    Short Sentences:
                </div>
                <div
                    style="background-color: #a3ff6a; color: #1A5D1A"
                    class="rounded flexed-center"
                >
                    ${
                        sentences.filter(
                            (sentence) =>
                                sentence.content.split(/\s+/).length <= 5
                        ).length
                    }
                </div>
            </div>
            <div class="flexed-wrap flexed-away">
                <div style="color: #DE8601" class="flexed-center">
                    Medium Sentences:
                </div>
                <div
                    style="background-color: #f2d374; color: #DE8601"
                    class="rounded flexed-center"
                >
                    ${
                        sentences.filter(
                            (sentence) =>
                                sentence.content.split(/\s+/).length > 5 &&
                                sentence.content.split(/\s+/).length <= 18
                        ).length
                    }
                </div>
            </div>
            <div class="flexed-wrap flexed-away">
                <div style="color: #9A2617" class="flexed-center">
                    Long Sentences:
                </div>
                <div
                    style="background-color: #ff6868; color: #9A2617" 
                    class="rounded flexed-center"
                >
                    ${
                        sentences.filter(
                            (sentence) =>
                                sentence.content.split(/\s+/).length > 18
                        ).length
                    }
                </div>
            </div>`
        )
    }

    function handleResponseOnExtension(res) {
        // visualize/show/print analysed data
        const { success, data } = res
        if (!success) {
            document.getElementById("editor-output").classList.add('error')
            document.getElementById("editor-output").innerHTML = "error, check console"
            return
        }

        const sentences = data.content[0].sentences

        document.getElementById("editor-output").innerHTML = 'Data Fetched'
        document.getElementById("editor-output").classList.add('hide')

        const analysed = document.getElementById("essay-analysed")
        analysed.classList.remove('hide')

        const highlighted = document.getElementById("essay-highlighted")
        highlighted.innerHTML = getHighlightedText(sentences)

        const breakdown = document.getElementById("essay-breakdown")
        breakdown.innerHTML = getBrokenDownText(sentences)

        const breakdownCount = document.getElementById("essay-breakdown-count")
        breakdownCount.innerHTML = getBrokenDownCount(sentences)

        const rhythm = document.getElementById("essay-rhythm")
        rhythm.innerHTML = getRhythm(sentences)

        const statistics = document.getElementById("essay-statistics")
        statistics.innerHTML = getStatistics(sentences)
    }

    const getData = async (selection) => {
        if (!selection?.length == 0) {
            document.getElementById("editor-output").innerHTML = "Loading..."

            const port = chrome.runtime.connect();
            port.postMessage({ selectedText: selection, user })
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
        if (/^https:\/\/essayanalyzer.netlify.app/.test(activeTab.url)) {
            setInterval(() => {
                chrome.tabs.sendMessage(activeTab.id, { type: "AUTH" }, (res) => {
                    if (res.success) {
                        localStorage.setItem("user", res.data)
                        user = res.data
                    } else {
                        localStorage.removeItem("user")
                        user = null
                    }
                })
            }, 1000)
        }

        if (!user) {
            document.getElementById("auth").classList.remove('hide')

            const loginBttn = document.querySelector('button[title=login]')
            const signupBttn = document.querySelector('button[title=signup]')

            loginBttn.addEventListener('click', function () {
                window.open('https://essayanalyzer.netlify.app?fromExtension=true', "_blank")
            })
            signupBttn.addEventListener('click', function () {
                window.open('https://essayanalyzer.netlify.app?fromExtension=true', "_blank")
            })

        } else {
            document.getElementById("auth").classList.add('hide')
            
            document.getElementById("user-info").classList.remove('hide')
            document.getElementById("user-info").innerHTML = user
            
            getSelectedText()
        }
    }

    launch()

})