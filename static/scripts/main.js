import { treeAnimation } from './utils/loading.js';
import { setupAddCard } from './utils/add.js';
import { initCalendar } from './utils/calender.js';
import { loadCardsFromStorage} from './utils/cardTransfer.js';
import { toggleEditMode } from './utils/edit_mode.js';
import { fetchWeather } from './utils/weather.js';
import { setupNotifications } from './utils/notifications.js';
import { updateUsername } from './utils/current_user.js';
import { themeToggle } from './utils/toggle_theme.js';
// treeAnimation();

const token = localStorage.getItem("authToken");

document.addEventListener('DOMContentLoaded', function() {
    updateUsername();
    initCalendar();
    fetchWeather("Irbid");

    // Set up edit button
    const editButton = document.getElementById('edit');
    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }

    // Set up Add Card AFTER loading from storage
    const { createCropCard, MAX_CROPS, addCardBtn } = setupAddCard();
    loadCardsFromStorage(createCropCard, MAX_CROPS, addCardBtn);

    themeToggle('settings');
    const { addNotification } = setupNotifications('noti');
    setTimeout(() => addNotification('KYS'), 3000);
});
