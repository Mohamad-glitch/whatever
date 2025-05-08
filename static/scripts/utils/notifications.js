async function fetchNotifications(authToken) {
    try {
        const response = await fetch('https://whatever-qw7l.onrender.com/farms/photo_analysis', {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching notifications: ${response.statusText}`);
        }

        const data = await response.json();
        const notifications = data.result; // Extract the 'result' field
        return notifications; // Return the object directly
    } catch (error) {
        console.error(error);
        return {};
    }
}

export async function setupNotifications(notificationButtonId) {
    console.log('Setting up notifications...');
    const authToken = localStorage.getItem('authToken'); // Retrieve the auth token from local storage
    const notificationButton = document.getElementById(notificationButtonId);

    const notificationBadge = document.createElement('span');
    const notificationDropdown = document.createElement('div');

    notificationBadge.className = 'notification-badge';
    notificationBadge.textContent = '0';
    notificationBadge.style.display = 'none';
    notificationButton.appendChild(notificationBadge);

    notificationDropdown.className = 'notification-dropdown';
    notificationDropdown.innerHTML = '<div class="notification-item">Loading notifications...</div>'; // Default message
    notificationButton.parentNode.appendChild(notificationDropdown);

    // Fetch notifications from the server
    const notifications = await fetchNotifications(authToken);

    // Clear default message and populate notifications
    notificationDropdown.innerHTML = ''; // Clear loading message
    if (Object.keys(notifications).length === 0) {
        notificationDropdown.innerHTML = '<div class="notification-item">There are no notifications</div>';
    } else {
        Object.keys(notifications).forEach(type => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.textContent = type; // Display only the key (type)
            notificationDropdown.appendChild(notificationItem);
        });

        notificationBadge.textContent = Object.keys(notifications).length;
        notificationBadge.style.display = 'block';
    }

    notificationButton.addEventListener('click', () => {
        if (notificationDropdown.classList.contains('open')) {
            notificationDropdown.style.maxHeight = '0'; // Collapse the dropdown
            notificationDropdown.style.opacity = '0'; // Fade out
            setTimeout(() => notificationDropdown.classList.remove('open'), 300); // Remove class after animation
        } else {
            notificationDropdown.classList.add('open');
            notificationDropdown.style.maxHeight = '250px'; // Expand the dropdown
            notificationDropdown.style.opacity = '1'; // Fade in

            // Reset the notification counter
            notificationBadge.textContent = '0';
            notificationBadge.style.display = 'none';
        }
    });

    function addNotification(message) {
        if (notificationDropdown.querySelector('.notification-item').textContent === 'There are no notifications') {
            notificationDropdown.innerHTML = ''; // Clear default message
        }

        const notificationCount = parseInt(notificationBadge.textContent, 10) + 1;
        notificationBadge.textContent = notificationCount;
        notificationBadge.style.display = 'block';

        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.textContent = message;
        notificationDropdown.appendChild(notificationItem);
    }

    return { addNotification };
}

setTimeout(() => {
    console.log('Fetching notifications every 30 seconds...');
}, 1000 * 30)

