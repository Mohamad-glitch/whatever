// main.js
import { treeAnimation } from './utils/loading.js';
import { setupAddCard } from './utils/add.js';
import { initCalendar } from './utils/calender.js';
import { loadCardsFromStorage} from './utils/cardTransfer.js';
import { toggleEditMode } from './utils/edit_mode.js';
import { fetchWeather } from './utils/weather.js';
import { setupNotifications } from './utils/notifications.js';
import { setupInfoCard } from './utils/info.js';

treeAnimation();
const token = localStorage.getItem("authToken"); // Replace with your actual JWT

fetch("https://whatever-qw7l.onrender.com/farms/", {
  method: "GET", 
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
})
.then(data => {
  console.log("Data:", data);
})
.catch(error => {
  console.error("Error:", error);
});


document.addEventListener('DOMContentLoaded', function() {
    initCalendar();

    setupInfoCard();
    
    // Set up edit button
    const editButton = document.getElementById('edit');
    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }

    // Set up Add Card AFTER loading from storage
    const { createCropCard, MAX_CROPS, addCardBtn } = setupAddCard();
    loadCardsFromStorage(createCropCard, MAX_CROPS, addCardBtn);    

    fetchWeather("Irbid");

    const { addNotification } = setupNotifications('noti');
    setTimeout(() => addNotification('first notification'), 3000);
});
