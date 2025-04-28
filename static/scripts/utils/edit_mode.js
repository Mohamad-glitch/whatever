// edit_mode.js - Revised Version
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

// Delete removed crops from backend (WORKING)
async function removeDeletedCropsFromBackend() {
    const token = localStorage.getItem('authToken');

    for (const card of deletedCards) {
        const cropId = card.id;
        try {
            await fetch(`https://whatever-qw7l.onrender.com/farms/crops/${cropId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
    deletedCards.push(card);
    card.style.display = "none"; // Hide temporarily
}