const VERSION = "v1";

const APP_STATIC_RESOURCES = [
    "index.html",
    "favorites.html",
    "app.js",
    "manifest.json",
    "assets/out.css"
];

const CACHE_NAME = `attractions-${VERSION}`;

//Open broadcast
const channel = new BroadcastChannel("app_comm");

//---------------- Service Worker Setup -----------------------------

//Load files into cache
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async() => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })
    )
})

//Clean out old cache via SW's activate event
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async() => {
            const names = await caches.keys();
            await Promise.all(
                names.map((n) => {
                    if(n !== CACHE_NAME) {
                        return caches.delete(n);
                    }
                })
            )
            await clients.claim()
        })
    );

})

/*------------------------------------------

        SKIPPING FETCH LISTENER
        DATA IS BEING LOADED LOCALLY

------------------------------------------*/

//Listening for message
channel.onmessage = (event) => {
    console.log("[SW]: Received a msg in SW");

    if(event.data = "fetch-locales");
    console.log("[SW]: Fetching locales");
    fetchData();
}

//Fetch json and load data into DB, alert APP through broadcast
function fetchData() {
    fetch("./data/locales.json")
    .then(res => res.json())
    .then((data) => {
        console.log("[SW]: Fetched locales" + data);
        return addDataToIndexedDB(data);
    })
    .then(() => {
        channel.postMessage("data-updated");
    }).catch((error) => {
        console.error("[SW]: Error fetching locales: " + error);
    })
}

//Load data into db helper, reads in json data
function addDataToIndexedDB(data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("AttractionsDB", 1);

        request.onerror = (event) => {
            reject("Indexed Error: ", event.target.error);
        }

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(["locales"], "readwrite");
            const store = transaction.objectStore("locales");

            data.locales.forEach((loc) => {
                store.put(loc);
            })

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject("[SW]: Transaction error: " + event.target.error);
        }

        request.onupgradeneeded = (event) => {
            const db = request.result;

            if(!db.objectStoreNames.contains("locales")) {
                db.createObjectStore("locales", {keyPath: "id"});
            }
        }

    })
}

