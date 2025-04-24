import { treeAnimation } from './utils/loading.js';
import { initCalendar } from './utils/calender.js';
import { loadCardsFromStorage } from './utils/cardTransfer.js';
import { toggleEditMode } from './utils/edit_mode.js';
import { fetchWeather } from './utils/weather.js';
import { setupNotifications } from './utils/notifications.js';
import { setupAddCard, MAX_CROPS, saveCardsToStorage } from './utils/add.js';

document.addEventListener('DOMContentLoaded', function () {
    try {
        // Start tree animation
        treeAnimation();

        // Initialize the calendar
        initCalendar();

        // Setup the informational card
        //setupInfoCard();

        // Toggle edit mode on click
        const editButton = document.getElementById('edit');
        if (editButton) {
            editButton.addEventListener('click', toggleEditMode);
        }

        // Setup the Add Card button
        setupAddCard(createCropCard, saveCardsToStorage);

        // Load saved cards from storage
        const addCardBtn = document.getElementById('add-card');
        loadCardsFromStorage(createCropCard, MAX_CROPS, addCardBtn);

        // Fetch weather data for Irbid
        fetchWeather("Irbid");

        // Setup notifications
        const { addNotification } = setupNotifications('noti');
        setTimeout(() => addNotification('first notification'), 3000);

    } catch (err) {
        console.error("Script initialization error:", err);
    }
});
