let currentMonth = new Date().getMonth(); // default to current month
let currentYear = new Date().getFullYear(); // default to current year

// index.html functionalities
// if it's the main page, display the calnedar with all events
window.onload = function () {
    if (window.location.pathname.includes("index.html")) {
        generateCalendar();
        loadSportData();
        displayEvents(currentMonth, currentYear);
        
    
    // add event listener for back & next button
    document.getElementById('prevMonth').addEventListener('click', prevMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);
    }

    // if it's details.html, display the details
    if (window.location.pathname.includes("details.html")) {
        displayEventDetails();
    }
};

// sisplay details for selected event on details.html
function displayEventDetails() {
    const events = JSON.parse(sessionStorage.getItem('events')) || [];

    // console.log("Events in sessionStorage:", events);

    // get event ID (date) from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventIndex = parseInt(urlParams.get('id'), 10); 

    // find event by index
    const event = events[eventIndex];

    // HTML structure for event details
    if (event) {
        const eventDetailsDiv = document.getElementById('eventDetails');
        
        const eventContent = `
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Sport:</strong> ${event.sportType}</p>
            <p><strong>Home Team:</strong> ${event.homeTeam}</p>
            <p><strong>Away Team:</strong> ${event.awayTeam}</p>
            <p><strong>Stage:</strong> ${event.stage}</p>
        `;
        
        // inject the content into event details div
        eventDetailsDiv.innerHTML = eventContent;
    } else {
        // if no event is found
        document.getElementById('eventDetails').innerHTML = "<p>No event found for this date.</p>";
    }
}



// Shift weekdays to Mon - Sun format
const getDayIndexMondaySunday = (date) => date.getDay() === 0 ? 6 : date.getDay() - 1;


// generate calendar
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // clear calendar before regenerating
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0); 
    const firstDayIndex = getDayIndexMondaySunday(firstDayOfMonth);
    const totalDays = lastDayOfMonth.getDate();

    // display current month & year on the page
    document.getElementById('monthYear').textContent = `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${currentYear}`;

    // make all days before first day blank
    for (let i = 0; i < firstDayIndex; i++) {
        let blankDay = document.createElement("div");
        calendar.appendChild(blankDay);
    }

    // create boxes for each day of the month
    for (let day = 1; day <= totalDays; day++) {
        let dayBox = document.createElement("div");
        dayBox.className = "calendar-day";
        dayBox.textContent = day;
        dayBox.id = `day-${day}`;
        calendar.appendChild(dayBox);
    }
    displayEvents(currentMonth, currentYear);  // make sure current events are displayed after generating the calendar
}



// add-event.html logic 
if (window.location.pathname.includes("add-event.html")) {
    const scheduleForm = document.getElementById('scheduleForm');
    scheduleForm.addEventListener('submit', function (e) {
        e.preventDefault(); 

        // get event details
        const eventDate = document.getElementById('schedule-date').value;
        const eventTime = document.getElementById('schedule-time').value;
        const sportType = document.getElementById('sportType-desc').value;
        const homeTeam = document.getElementById('homeTeam-desc').value;
        const awayTeam = document.getElementById('awayTeam-desc').value;
        const stage = document.getElementById('stage-desc').value;

        // make sure event date is in YYYY-MM-DD format
        const formattedDate = new Date(eventDate).toISOString().split('T')[0];

        // get existing events from sessionStorage or create an empty array if none
        const events = JSON.parse(sessionStorage.getItem('events')) || [];

        // add new event to the events array
        events.push({
            date: formattedDate,
            time: eventTime,
            sportType: sportType,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            stage: stage
        });

        // store updated events array in sessionStorage
        sessionStorage.setItem('events', JSON.stringify(events));

        // redirect to main calendar page
        window.location.href = 'index.html';
    });
}





// Display events from sessionStorage on the calendar
function displayEvents(currentMonth, currentYear) {
    const events = JSON.parse(sessionStorage.getItem('events')) || [];

    // // log the current month and year
    // console.log("Displaying events for: " + currentMonth + "/" + currentYear);
    // // log the events in sessionStorage
    // console.log("Events from sessionStorage:", events);

    const calendar = document.getElementById('calendar');

    // clear previous events before displaying new ones
    const eventDivs = document.querySelectorAll('.schedule');
    eventDivs.forEach(div => div.remove());

    events.forEach((event, index) => {
        const eventDate = new Date(event.date);
        const eventMonth = eventDate.getMonth();  // get month of event date
        const eventYear = eventDate.getFullYear(); // get year of event date

        // only display events for the current month and year
        if (eventMonth === currentMonth && eventYear === currentYear) {
            const dayBox = document.getElementById(`day-${eventDate.getDate()}`);

            if (dayBox) {
                const eventDiv = document.createElement("div");
                eventDiv.className = "schedule";

                // only display homeTeam vs awayTeam in calendar
                const eventDesc = `${event.homeTeam} vs ${event.awayTeam}`;

                // link for each event to open details.html (with index as a parameter)
                const eventLink = document.createElement("a");
                eventLink.href = `details.html?id=${index}`; // use index as identifier
                eventLink.textContent = eventDesc;
                eventLink.classList.add("event-link");

                eventDiv.appendChild(eventLink);
                dayBox.appendChild(eventDiv);
            }
         }
    });
}

// Load sport data from JSON file
function loadSportData() {

    // only fetch JSON data if it wasn't already added before
    const isJsonDataLoaded = sessionStorage.getItem('isJsonDataLoaded');

    if (isJsonDataLoaded) {
        console.log("JSON data already loaded, skipping fetch.");
        displayEvents();
        return; // don't load JSON data if it's already in sessionStorage
    }

    fetch('sportData.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch the sport data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Sport data loaded:', data);
            // get existing events from sessionStorage 
            const userEvents = JSON.parse(sessionStorage.getItem('events')) || [];

            const jsonEvents = data.data.map(function(event) {
                return {
                    date: event.dateVenue, 
                    time: event.timeVenueUTC,
                    sportType: event.sport,
                    stage: event.stage.name,
                    homeTeam: event.homeTeam ? event.homeTeam.name : 'TBD',
                    awayTeam: event.awayTeam ? event.awayTeam.name : 'TBD'
                };
            });
            

            // combine user added events with imported events from JSON
            const allEvents = [...userEvents, ...jsonEvents];

            // store all events (both user and imported events) in sessionStorage
            sessionStorage.setItem('events', JSON.stringify(allEvents));

            // mark the JSON data as loaded in sessionStorage
            sessionStorage.setItem('isJsonDataLoaded', true);

            displayEvents(currentMonth, currentYear);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


// month navigation button functionality
function prevMonth() {
    if (currentMonth === 0) { // If it's January, go to December of the previous year
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }

    // console.log("Prev Month, after update, currentMonth:", currentMonth, "currentYear:", currentYear);

    generateCalendar(); // Regenerate the calendar for the previous month
    displayEvents(currentMonth, currentYear); // Display events for the previous month
}

function nextMonth() {
    if (currentMonth === 11) { // If it's December, go to January of the next year
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }

    // console.log("Next Month, after update, currentMonth:", currentMonth, "currentYear:", currentYear);

    generateCalendar(); // Regenerate the calendar for the next month
    displayEvents(currentMonth, currentYear); // Display events for the next month
}