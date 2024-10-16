//create constants for the form and form controls
const newVacationFormEl = document.getElementsByTagName("form")[0];
const startDateInputEl = document.getElementById('start-date');
const endDateInputEl = document.getElementById("end-date");

//listen to form submissions
newVacationFormEl.addEventListener("submit", (event)=>{
    //prevent form from submitting to the server
    //since everything in done client side
    event.preventDefault();

    //get dates from the form
    const startDate = startDateInputEl.value;
    const endDate = endDateInputEl.value;

    //check if the dates are invalid
    if(checkDatesInvalid(startDate, endDate)){
        return; //dont "submit the form, just exit"
    }

    //store the new vacation in our client-side storage
    storeNewVacation(startDate, endDate);

    //refresh the UI
    renderPassVacations();

    //reset the form 
    newVacationFormEl.reset();
});

function checkDatesInvalid(startDate, endDate){
    if(!startDate || !endDate || startDate > endDate){
        //should do error message and clear form if anything is invalid
        newVacationFormEl.reset();
        return true; //something is invalid
    }else{
        return false;
    }
}

//add the storage key as an app-wide constant
const STORAGE_KEY = "vaca_tracker";

function storeNewVacation(startDate, endDate){
    //get data from storage
    const vacations = getAllStoredVacations();//returns array of strings
    //add the new vacation at the end of the array
    vacations.push({startDate, endDate});
    //sort the array so newest to oldest vacations
    vacations.sort((a, b) =>{ 
        return new Date(b.startDate) - new Date(a.startDate);
    });

    //store the new array back in storage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vacations));
}//store new Vacation

//retrieves all stored vacations
function getAllStoredVacations() {
    const vacations = data ? JSON.parse(data) : []

    return vacations;
}

//renders all our past/stored vacations
function renderPastVacations() {
    const vacations = getAllStoredVacations;

    if (vacations.length == 0) {
        return;
    }

    pastVacationContainer.innterHTML = "";

    const pastVacationHeader = document.createElement("h2");
    pastVacationHeader.textContent = "Past Vacations";

    const pastVacationList = document.createElement("ul");

    vacations.forEach((v) => {
        const vacationEl = document.createElement("li");

        vacationEl.textContent = `From ${formatDate(vacation.startDate)} to ${formatDate(vacation.endDate)}`;
        pastVacationList.appendChild(vacationEl);
    });

    pastVacationContainer.appendChild(pastVacationHeader);
    pastVacationContainer.appendChild(pastVacationList);
} //renderPastVacations

//format the date into a locale specific string.
//include your locale for a better use experience.
function formatDate(dateString) {
    //convert the date string into a date object
    const date = new Date(dateString);

    return date.toLocaleDateString("en-us",{timeZone: "UTC"});
};

//start the app by rendering the past vacations on load, if any.
renderPastVacations();

// if("serviceWorker" in navigator) {
//     navigator.serviceWorker.register("sw.js").then((registration) => {
//         console.log("SW registered w/ scope: ", registration.scope);
//     }).catch((error) => {
//         console.log("Registration failed: ", error);
//     });
// };

// navigator.serviceWorker.addEventListener("message", (event) => {
//     console.log("Received a message from SW: ", event.data);

//     if(even.datatype === "update") {
//         console.log("update Received", event.data.data);
//     };
// });

// function sendMessageToSW(message) {
//     if(navigator.serviceWorker.controller) {
//         navigator.serviceWorker.controller.postMessage(message);
//     };
// };

// document.getElementById("sendButton").addEventListener("click", () => {
//     sendMessageToSW({type: "action", data: "Button clicked"});
// });

const channel = new BroadcastChannel("pwa_channel");

channel.onmessage = (event) => {
    console.log("Message Received");
    document.getElementById("message").insertAdjacentElement("beforeend", `<p>Received: ${event.data}</p>`);
};

document.getElementById("sendButton").addEventListener("click", () => {
    const message = "Hello PWA!";
    channel.postMessage(message);
    console.log("Sent message from PWA: ", message);
});

let db;
const dbName = "SyncDB";
const request = indexedDB.open(dbName, 1);

request.onerror = function (event) {
    console.error("Database error: " + event.target.error);
}

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database opened successfully");
}

request.onupgradeneeded = function (event) {
    const objectStore = db.createObjectStore("pendingData", 
    {
        keyPath: "id",
        autoIncrement: true,
    });
}

//Adding data to DB, must use transaction
function addDataToIndexedDB(data) {
    return new Promise((resolve, reject)=> {
        const transaction = db.transaction(["pendingData"], "readwrite");
        const objectStore = trasnaction.objectStore("pendingData");
        const request = objectStore.add({data: data});

        request.onsuccess = function(event) {
            resolve();
        }

        request.onerror = function(evennt) {
            reject("Error storing data: " + event.target.error);
        }
    });
}

document.getElementById("dataForm").addEventListener("submit", function(event){
    event.preventDefault();

    const data = document.getElementById("dataInput").value;

    //Chceck to see if both sw and SyncManager is available
    if("serviceWorker" in navigator && "SyncManager" in window) {
    //we're good add data to db for offline use
        addDataToIndexedDB(data)
        .then(() => navigator.serviceWorker.ready) //wait for sw to be ready
        .then((registration) => {
            //registeers a syunc event for when the device becomes online
            return registration.sync.register("send-data");
        })
        .then(() => {
            document.getElementById("status").textContent = "Sync Registered. Data will be sent when online";
        })
    } else {
        sendData(data).then((result) => {
            document.getElementById("status").textContent = result;
        }).catch((error) => {
            document.getElementById("status").textContent = error.message;
        });
    }
});

function sendData(data) {
    console.log("Attempting to send data:", data);

    return new Promise((resolve, reject) =>{
        setTimeout(()=>{
            if(Math.random() > 0.5) {
                resolve("Data sent successfully");
            } else {
                reject(new Error("Failed to send data"));
            }
        },1000);
    });
}