const VERSION = "v1";

//offline resource list
const APP_STATIC_RESOURCES = [
    "index.html",
    //if other html pages, list them here as well
    "style.css",
    "app.js",
    "vacationtracker.json",
    "assets/icons/icon-512x512.png"
];

const CACHE_NAME = `vacation-tracker-${VERSION}`;

/handle the install event and retrieve and store the file listed for the cache/
self.addEventListener("install", (event)=>{
    event.waitUntil(
        (async()=>{
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })()
    );
});

/use the activate event to delete any old caches so we don't run out of space. The one getting deleted will be all but the current one. Then set the service worker as the controller for our app(PWA),/

self.addEventListener("activate", (event) =>{
    event.waitUntil(
        (async() => {
            //get the names of the existing caches
            const names = await caches.keys();
            //iterate through the list and check each one to see if it's the current and delete it if it isnt. 
            await Promise.all(
                names.map((name) => {
                    if(name !== CACHE_NAME){
                        return caches.delete(name);
                    }
                })
            );//promise all 
            //use the claim() method of client's interface to enable our service worker as the controller
            await clients.claim();
        })()
    ); //waitUntil
});

/use the fetch event to intercept requests to the server so we can serve up our cached pages or respond with an error or 404/
self.addEventListener("fetch", (event)=>{
    event.respondWith(
        (async()=>{
            //try to get resource from the cache
            const cachedResponse = await cache.match(event.request);
            if(cachedResponse){
                return cachedResponse;
            }
            //if not in the cache, try to fetch from the network
            try{
                const networkResponse = await fetch(event.request);
                //cache the new reponse for future use 
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            }catch(error){
                console.error("Fetch failed; returning offline page instead.", error);
                //if request is for a page, return index.html as a fallback
                if(event.request.mode == "navigate"){
                    return cache.match("/index.html");
                }

                //for everything else, we're just going to throw an error, you might want to return a default offline asset instead
                throw error;
            }
        })()
    );//respond with 
});//fetch

function sendMessageToPWA(message) {
    self.clients.matchAll().then((cl) => {
        cl.forEach((c) => {
            c.postMessage(message);
        })
    });
};

setInterval(()=>{
    sendMessageToPWA({type:"update", data:"New Data Available"})
},10000);

self.addEventListener("message", (event) => {
    console.log("Service worker received a message", event.data);

    event.source.postMessage({
        type: "response",
        data: "Message received by SW",
    })
});

const channel = new BroadcastChannel("pwa_channel");

channel.onmessage = (event) => {
    console.log("Message Received in SW");

    channel.postMessage("Service Worker receeived:" + event.data);
};

//open or create db
let db;
const dbName = "SyncDB";
const request = indexedDB.open(dbName, 1); //name and version need to match app.js

request.onerror = function (event) {
    console.error("Database error: " + event.target.error);
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database opened successfully in SW");
};

self.addEventListener("sync", function(event) {
    if (event.tag === "send-data") {
        event.waitUntil(sendDataToServer());
    }
});

function sendDataToServer() {
    return getAllPendingData().then(function(dataList) {
            return Promise.all(
                dataList.map(function(item) {
                    return new Promise((resolve,reject) => {
                        setTimeout(()=>{
                            if(Math.random() > 0.1) {
                                console.log("Data sent successfully: ", item.data);
                                resolve(item.id);
                                reject(new Error("Failed to send data"));
                            }
                        },1000);
                    })
                    .then(function() {
                        //on success, remove item
                        return removeDdataFromIndexedDB(item.id);
                    });
                })
            )
        }
    )
};

function getAllPendingData() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["pendingData"], "readonly");
        const objectStore = transaction.objectStore('pendingData');
        const request = objectStore.getAll();

        request.onsuccess = function(event) {
            resolve(event.target.result);
        }

        request.onerror = function(event) {
            reject("Error fetching data"+event.target.error);
        }
    })
}