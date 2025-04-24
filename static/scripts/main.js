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
