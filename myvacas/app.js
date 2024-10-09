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

if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then((registration) => {
        console.log("SW registered w/ scope: ", registration.scope);
    }).catch((error) => {
        console.log("Registration failed: ", error);
    });
};

navigator.serviceWorker.addEventListener("message", (event) => {
    console.log("Received a message from SW: ", event.data);

    if(even.datatype === "update") {
        console.log("update Received", event.data.data);
    };
});

function sendMessageToSW(message) {
    if(navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
    };
};

document.getElementById("snedButton").addEventListener("click", () => {
    sendMessageToSW({type: "action", data: "Button clicked"});
});