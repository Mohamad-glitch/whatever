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
            removeDeletedCropsFromBackend();
        } else {
            deletedCards.forEach(card => card.style.display = "block");
        }
        disableEditMode();
    }
    updateEditButtonUI();
}
//
// async function removeDeletedCropsFromBackend() {
//     const token = localStorage.getItem('authToken');
//
//     for (const card of [...deletedCards]) { // Create copy of array
//         try {
//             const cropId = extractNumericId(card.id);
//             const response = await fetch(`https://whatever-qw7l.onrender.com/farms/crops/${cropId}`, {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//
//             if (response.status === 404) {
//                 console.warn(`Crop ${cropId} not found - removing from UI anyway`);
//                 card.remove();
//                 continue;
//             }
//
//             if (!response.ok) throw new Error(`HTTP ${response.status}`);
//
//             card.remove();
//         } catch (error) {
//             console.error(`Deletion failed:`, error);
//             card.style.display = "block";
//         }
//     }
//     deletedCards = [];
// }

function extractNumericId(id) {
    // Handle both "crop-123" and raw number formats
    return id.toString().replace('crop-', '');
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