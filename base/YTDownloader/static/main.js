video_find_form = document.querySelector("#find_form")
url_input = document.querySelector("#url_input")
csrf_token_input = document.querySelector("input[type=hidden") 
let resSelectedItag = "22"


/**
 * function that cut a long text
 * @param {String} text 
 */
function truncateText (text) {
    let newText = text

    const text_splited = text.split(" ")
    if (text_splited.length > 25) {
        newText = (text_splited.slice(0, 26)).join(" ") + "..."
    }
    return newText
}


function updateDownloadLink (videoId) {
    const baseUrl = '/download/'
    const url = baseUrl + videoId + "/" + resSelectedItag + "/"
    const downloadLinkElement = document.querySelector("#video_found a")
    downloadLinkElement.setAttribute("href", url)
}
function clearLoader () {
    document.querySelector(".custom-loader").classList.remove("show")
}

function loading () {
    document.querySelector(".custom-loader").classList.add("show")
}

/**
 * @param {String} url 
 */
async function get_video (url) {
    loading()
    fetch("/videofinder/", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token_input.value,
            },

            body: JSON.stringify({
                url: url
            })
        }
    )
        .then(r => {
            if (r.ok) {
                clearLoader()
                return r.json()
            }
        })
        .then (video => {
            
            // console.log(video.title)
            const result_container = document.querySelector("#video_found") 

            const result_node = document.querySelector("#result_found").content.cloneNode(true)
            result_node.querySelector("img").setAttribute("src", video.thumb_url)
            result_node.querySelector(".title").innerText = video.title
            // result_node.querySelector(".desc").innerText = truncateText(video.desc)
 
            // resolutions
            const resContainerElement = result_node.querySelector("#res")
            video.res_list.forEach(element => {
                option = document.createElement("option")
                option.setAttribute("value", element.itag)

                res = element.mime_type + " - "
                if (element.res) {
                    res += element.res
                } else {
                    res += element.abr
                }
                option.innerText = res

                if (element.itag === 22) {
                    option.setAttribute("selected", "")
                }
                resContainerElement.appendChild(option)
            });

            

            const content = document.createElement("div")
            content.setAttribute("class", "content")
            content.appendChild(result_node)

            // add to container
            if (result_container.firstElementChild) {
                result_container.removeChild(result_container.firstElementChild);
            }
            result_container.appendChild(content)

            // show result section
            document.querySelector("main section:last-child").classList.add("visible")

            // download link
            updateDownloadLink(video.video_id)

            resContainerElement.addEventListener("change", (event) => {
                resSelectedItag = resContainerElement.value
                updateDownloadLink(video.video_id)
            })
        })
}  
video_find_form.addEventListener("submit", (event) => {
    event.preventDefault()
    get_video(url_input.value) 
})



