const likeOn = "pro-toggle-like"
const dislikeOn = "pro-toggle-dislike"

function selectVote(form, value) {
    const revId = form.getAttribute("data-review")
    const [likeButton, dislikeButton] = form.getElementsByTagName("label")

    if (value === "like") {
        likeButton.classList.add(likeOn)
        dislikeButton.classList.remove(dislikeOn)
    } else if (value === "dislike") {
        likeButton.classList.remove(likeOn)
        dislikeButton.classList.add(dislikeOn)
    }
}

window.onload = function() {
    const forms = Array.from(document.getElementsByClassName('vote-form'))

    const xhttp = new XMLHttpRequest()
    xhttp.open("GET", "/auth/authorized", true)
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState != 4) {
            return
        }

        for (let i = 0; i < forms.length; i++) {
            forms[i].querySelectorAll("input[name='vote']").forEach(input => {
                if (xhttp.status == 200) {
                    input.addEventListener("change", (e) => {
                        selectVote(forms[i], e.target.value)
                    })
                } else {
                    setUpPopup(input, lor_container)
                }
            })
        }
    }

    xhttp.send()
}