//Registration
if("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
        .register("sw.js")
        .then((registration) => {
            console.log("[APP]: Service worker registered with scope: " + registration.scope);
        })
        .then(() => {
            navigator.serviceWorker.ready.then(() => {
                fetchLocales();
            })
        })
        .catch((error) => {
            console.log("[APP]: Registration failed: " + error);
        })
    })
};

//Main container for render/display
const locCont = document.getElementById("localesList");

//Modal Elements
const modal = document.getElementById("modal");
const modalBanner = document.getElementById("modalBanner");
const modalHeader = document.getElementById("modalHeader");
const tagsCont = document.getElementById("tags");
const address = document.getElementById("address");
const modalDesc = document.getElementById("desc");

//Close modal and clean modal contents
document.getElementById("close").addEventListener("click", () => {
    modal.style.display = "none";

    while(tagsCont.hasChildNodes()) {
        tagsCont.removeChild(tagsCont.lastChild);
    }
})

//Open broadcast channel
const channel = new BroadcastChannel("app_comm");

//Listen for msgs to update display
channel.onmessage = (event) => {
    console.log("[APP]: Received msg in PWA: " + event.data);

    if (event.data === "data-updated") {
        console.log("[APP]: Data Updated!");
        renderLocales();
    } else if (event.data === "sw-ready") {
        fetchLocales();
    }
}

//Fetch locale data and load into our db
function fetchLocales() {
    channel.postMessage("fetch-locales");
    console.log("[APP]: Requested data from SW");
}

//Open IndexDB
let db;
const request = indexedDB.open("AttractionsDB", 1);
request.onerror = (event) => {
    console.log("[APP]: Error opening DB: " + event.target.error);
}
request.onsuccess = (event) => {
    db = event.target.result
    console.log("[APP]: DB opened successfully!");
}
request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore("locales", {keyPath: "id"});
}

//Grabs data from DB and returns array;
function getLocales() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("AttractionsDB", 1);

        request.onerror = (event) => {
            reject("[APP]: DB Error: ", event.target.error);
        }

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("locales", "readonly");
            const objectStore = transaction.objectStore("locales");

            const objs = [];
            objectStore.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;

                if(cursor) {
                    objs.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(objs);
                }
            }

            transaction.oncomplete = () => {db.close()}
            transaction.onerror = (event) => {
                reject("[APP]: DB Reading Error" + event.target.error);
            }
        }

    })
}

//Render function
function renderLocales() {
    getLocales()
    .then((locs) => {
        locs.map((loc) => {
            let card = document.createElement("div");
            
            let title = document.createElement("h2");
            title.innerText = loc.name;

            let img = document.createElement("img");
            img.srcset = loc.images;

            let cover = document.createElement("div");

            let button = document.createElement("button");
            button.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='size-6'> <path stroke-linecap='round' stroke-linejoin='round' d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' /></svg>";

            button.addEventListener("click", () => {
                registerFave(loc);
            })

            cover.appendChild(button);
            cover.appendChild(title);
            card.appendChild(cover);
            card.appendChild(img);

            title.addEventListener("click", function() {
                modal.style.display = "block";

                modalHeader.innerText = loc.name;
                modalBanner.srcset = loc.images;

                loc.tags.map((t) => {
                    tag = document.createElement("span");
                    tag.innerText = t;
                    tag.classList.add("tag");
                    tagsCont.appendChild(tag);
                });

                address.innerText = loc.address;
                modalDesc.innerText = loc.description;
            })

            card.classList.add("card");
            locCont.appendChild(card);
        })
    })
}

//Register a favorite
function registerFave(data) {
    //Parse localstorage to grab current favorites
    let stored = JSON.parse(localStorage.getItem("favorites"));
    //Stringify the object being favorited
    let jdata = JSON.stringify(data);

    //Check if storage is null, if so load in empty array with the current favorited item
    if(stored == null) {
        let faves = [];
        faves.push(jdata);
        localStorage.setItem("favorites", JSON.stringify(faves));
    } else {
        //Else raise a flag, iterate through already favorited to check if the current item has already been favorited
        let flag = true;

        stored.forEach((e) => {
            if(JSON.parse(e).id == data.id) {
                console.log("[APP]: Error, locale already favorited!");
                flag = false;
            }
        })

        if(flag) {
            stored.push(jdata);
            localStorage.setItem("favorites", JSON.stringify(stored));
        }
    }
}

//Remove favorited item via id
function unRegisterFave(id) {
    let stored = JSON.parse(localStorage.getItem("favorites"));

    stored.forEach((e) => {
        if(JSON.parse(e).id == id) {
            const index = stored.indexOf(e);
            const x = stored.splice(index, 1);
        }
    })

    localStorage.setItem("favorites", JSON.stringify(stored));
    console.log("Unfavorited: " + id);
    location.reload();
}

//Grabs localstorage entry and renders onto favorites page
function loadFaves() {
    let stored = JSON.parse(localStorage.getItem("favorites"));
    let parsed = [];

    stored.forEach((e) => {
        parsed.push(JSON.parse(e));
    })

    let cont = document.getElementById("favList");

    parsed.map((loc) => {
        let card = document.createElement("div");
        
        let title = document.createElement("h2");
        title.innerText = loc.name;

        let img = document.createElement("img");
        img.srcset = loc.images;

        let cover = document.createElement("div");

        let button = document.createElement("button");
        button.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='size-6 hover:fill-red-400'><path stroke-linecap='round' stroke-linejoin='round' d='m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' /></svg> ";

        button.addEventListener("click", () => {
            unRegisterFave(loc.id);
        })

        cover.appendChild(button);
        cover.appendChild(title);
        card.appendChild(cover);
        card.appendChild(img);

        card.classList.add("card");
        cont.appendChild(card);
    })
}