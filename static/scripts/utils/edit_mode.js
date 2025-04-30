// edit_mode.js - Final Debugged Version
let isEditMode = false;
let deletedCards = [];

export function toggleEditMode() {
    if (!isEditMode) {
        // Enter edit mode
        isEditMode = true;
        document.querySelectorAll('.remove-card').forEach(button => {
            button.style.display = "block";
            button.addEventListener('click', handleCardRemoval);
        });
    } else {
        // Exit edit mode
        const confirmed = confirm("Confirm crop deletions?");
        if (confirmed) {
        } else {
            deletedCards.forEach(card => card.style.display = "block");
        }
        disableEditMode();
    }
    updateEditButtonUI();
}

function handleCardRemoval(e) {
    const card = e.target.closest('.card');
    if (card) {
        deletedCards.push(card);
        card.style.display = "none";
    }
}

function updateEditButtonUI() {
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