
const url_input = document.querySelector("#url_input")
const video_find_form = document.querySelector("#find_form")
let downloadLink = ""


/**
 * Update the download link
 * @param {String} videoId
 * @param {String} itag
 */
function updateDownloadLink (videoId, itag) {
    const baseUrl = '/download/'
    downloadLink = baseUrl + videoId + "/" + itag + "/"
    // const downloadLinkElement = document.querySelector("#video_found a")
    // downloadLinkElement.setAttribute("href", url)
}


/**
 * Create a HTML element with attributes given in an object
 * @param {String} tag
 * @param {Object} attributes
 * @returns {HTMLElement} element
 */
function createNode (tag, attributes) {
    const element = document.createElement(tag)
    for (const key in attributes) {
        element.setAttribute(key, attributes[key])
    }
    return element
}


/**
 * get video id from url
 * @param {String} url YouTube video url 
 * @returns {String} video id
 */
function get_video_id(url) {
    return (url.split("/")).slice(-1)[0].split("=").slice(-1)[0]
}


/**
 * let create YouTube video type
 * @typedef {Object} YouTubeVideo 
 * @property {String} title : title of the video
 * @property {String} length :  length of the video
 * @property {String} thumb_url : url the video thumbnail
 * @property {String} video_id : id of the video
 * @property {String} res_list : list of the video resolutions
 */


/**
 * Fetch video informations from server
 * @param {String} url YouTube video url
 * @returns {Promise} 
 */
async function fetchVideo (url) {
    // show loader
    showLoader(document.querySelector(".section.left"), {
        "width": "30px",
        "height": "30px",
        "margin": "auto",
    })

    const video_id = get_video_id(url)

    response = await fetch(`/videofinder/${video_id}`, {
        method: "GET",
        headers: {"Accept": "application/json",}
    })
    if (response.ok) {
        return response.json()
    }
}

/**
 * get video with informations given
 * @param {Object} video informations
 * @returns {YouTubeVideo} video object
 */
function getVideoObject(informations) {
    return {
        title: informations.title,
        length: informations.length,
        thumb_url: informations.thumb_url,
        video_id: informations.video_id,
        res_list: informations.res_list
    }
}


/** 
 * Show video informations in DOM
 * @param {YouTubeVideo} video
 * @param {HTMLElement} container
 * return {HTMLElement} video node
 */
function showVideoInDOM (video, container) {
    // get template
    const videoNode = createNode("div", {"class": "content"})
    videoNode.appendChild(
        document.querySelector("#result_found").content.cloneNode(true)
    )

    // set video informations
    videoNode.querySelector(".title").innerText = video.title
    videoNode.querySelector("img").setAttribute("src", video.thumb_url)

    // get video resolutions
    const resContainerElement = videoNode.querySelector("#res")
    video.res_list.forEach(element => {
        const option = document.createElement("option")
        option.setAttribute("value", element.itag)
        option.innerText = element.mime_type + " - " + element.res
        resContainerElement.appendChild(option)
    })

    // add to container
    container.innerHTML = ""
    container.appendChild(videoNode)
    return videoNode
}

/**
 * Create and show a loader in DOM
 * @param {HTMLElement} container where the loader will be added
 * @param {Object} styles styles of the loader
 */
function showLoader (container, styles) {
    const loader = createNode("div", {"class": "custom-loader"})

    // set styles
    for (const key in styles) {
        loader.style[key] = styles[key]
    }

    container.appendChild(loader)
}

/**
 * clear the loader in DOM
 * @param {HTMLElement} container where the loader will be removed
 */
function clearLoader (container) {
    container.removeChild(container.querySelector(".custom-loader"))
}


/**
 * Proceed to download the video
 * @param {String} downloadUrl
 */
async function downloadVideo (downloadUrl) {

    // show loader
    showLoader(document.querySelector(".action"), {
        "width": "20px",
        "height": "20px",
    })

    const r = await fetch(downloadUrl, {
        method: "GET",
        headers: {"Accept": "video/mp4",}
    })

    if (r.ok) {
        return r.blob()
    }
}


// ------------------- main ---------------


// video getting listener
video_find_form.addEventListener("submit", (event) => {
    event.preventDefault()

    const url = url_input.value
    fetchVideo(url)
        .then(video_infos => {
            // hide loader
            clearLoader(document.querySelector(".section.left"))

            const video = getVideoObject(video_infos)

            const container = document.querySelector("#video_found")
            showVideoInDOM(video, container)

            // show right section 
            document.querySelector(".section.right").style.display = "block"


            // update download link
            updateDownloadLink(video.video_id, document.querySelector("#res").value)

            // listen to the change event of the resolution select to update the download link
            document.querySelector("#res").addEventListener("change", (event) => {
                event.preventDefault()
                
                const itag = document.querySelector("#res").value
                updateDownloadLink(get_video_id(url_input.value), itag)
            })

            // listen to the click event of the download button
            document.querySelector("#download-btn").addEventListener("click", (event) => {
                event.preventDefault()

                downloadVideo(downloadLink)
                    .then(blob => {
                        var url = URL.createObjectURL(blob);
                        var link = createNode("a", {
                            "href": url,
                            "download": `${video.title}.mp4`
                        })

                        // hide loader
                        clearLoader(document.querySelector(".action"))

                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })
            })
        })
})



