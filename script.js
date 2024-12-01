
// index.html functionalities
// if it's the main page, display the calnedar with all events
window.onload = function () {
    if (window.location.pathname.includes("index.html")) {
        generateCalendar();
        displayEvents();
        loadSportData();
    }
};

// generate calendar
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0); 
    const firstDayIndex = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    // make all days before first day blank
    for (let i = 1; i < firstDayIndex; i++) {
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

        // get existing events from sessionStorage or create an empty array if none
        const events = JSON.parse(sessionStorage.getItem('events')) || [];

        // add new event to the events array
        events.push({
            date: eventDate,
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
function displayEvents() {
    const events = JSON.parse(sessionStorage.getItem('events')) || [];

    events.forEach(event => {
        const eventDate = new Date(event.date);
        const dayBox = document.getElementById(`day-${eventDate.getDate()}`);

        if (dayBox) {
            const eventDiv = document.createElement("div");
            eventDiv.className = "schedule";

            // only display homeTeam vs awayTeam in calendar
            const eventDesc = `${event.homeTeam} vs ${event.awayTeam}`;

            eventDiv.textContent = eventDesc;
            dayBox.appendChild(eventDiv);
        }
    });
}

// Load sport data from JSON file
function loadSportData() {
    fetch('sportData.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch the sport data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Sport data loaded:', data);
            displaySportEvents(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Loop through all the events in the data and get date of the event
function displaySportEvents(data) {
    data.data.forEach(event => {
        const eventDate = new Date(event.dateVenue);
        const dayBox = document.getElementById(`day-${eventDate.getDate()}`);
        
        if (dayBox) {
            const eventDiv = document.createElement("div");
            eventDiv.className = "schedule";

            // Description: hometeam vs awayteam, if any names are null, display TBD
            const homeTeamName = event.homeTeam ? event.homeTeam.name : 'TBD';
            const awayTeamName = event.awayTeam ? event.awayTeam.name : 'TBD';
            const eventDesc = `${homeTeamName} vs ${awayTeamName}`;

            
            eventDiv.textContent = eventDesc;
            dayBox.appendChild(eventDiv);
        }
    });
}
