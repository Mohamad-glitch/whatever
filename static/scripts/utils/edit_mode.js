// edit_mode.js - Final Updated Version
let isEditMode = false;
const MAX_NAME_LENGTH = 20;
let originalTitles = [];
let deletedCards = [];

export function toggleEditMode() {
    const cropTitles = document.querySelectorAll('.growth-cards .card:not(.add-card) h3');
    const addCardBtn = document.getElementById('add-card');

    if (!isEditMode) {
        // Enter edit mode
        isEditMode = true;
        originalTitles = Array.from(cropTitles).map(title => title.textContent);
        deletedCards = [];

        // Show remove buttons only
        document.querySelectorAll('.remove-card').forEach(button => {
            button.style.display = "block";
            button.addEventListener('click', handleCardRemoval);
        });

    } else {
        // Exit edit mode - ONLY handle deletions
        const confirmed = confirm("Confirm crop deletions?");
        if (confirmed) {
            removeDeletedCropsFromBackend(); // Only deletion, no updates
        } else {
            // Restore deleted cards if cancelled
            deletedCards.forEach(card => card.style.display = "block");
            deletedCards = [];
        }
        disableEditMode();
    }

    // Update edit button UI
    const editButton = document.getElementById('edit');
    if (editButton) {
        editButton.classList.toggle('active', isEditMode);
        editButton.innerHTML = isEditMode
            ? '<i class="fas fa-check"></i>'
            : '<i class="fas fa-edit"></i>';
    }
}

export function disableEditMode() {
    isEditMode = false;
    document.querySelectorAll('.remove-card').forEach(btn => {
        btn.style.display = "none";
    });
}

// Delete removed crops from backend
async function removeDeletedCropsFromBackend() {
    const token = localStorage.getItem('authToken');

    for (const card of deletedCards) {
        // Extract numeric ID from "crop-12345" format
        const cropId = card.id.startsWith('crop-')
            ? card.id.replace('crop-', '')
            : card.id;

        try {
            const response = await fetch(`https://whatever-qw7l.onrender.com/farms/crops/${cropId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            card.remove(); // Physically remove from DOM after successful deletion
        } catch (error) {
            console.error(`Failed to delete crop ${cropId}:`, error);
            card.style.display = "block"; // Restore if deletion fails
        }
    }
    deletedCards = []; // Clear cache
}

function handleCardRemoval(e) {
    const card = e.target.closest('.card');
    if (card) {
        deletedCards.push(card);
        card.style.display = "none"; // Hide temporarily
    }
}