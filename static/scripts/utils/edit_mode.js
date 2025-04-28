let isEditMode = false;
const MAX_NAME_LENGTH = 20;
let originalTitles = [];
let deletedCards = []; // Store deleted cards during edit mode

export function toggleEditMode() {
    const cropTitles = document.querySelectorAll('.growth-cards .card:not(.add-card) h3');
    const addCardBtn = document.getElementById('add-card');

    if (!isEditMode) {
        // Entering edit mode
        isEditMode = true;

        // Store original titles
        originalTitles = Array.from(cropTitles).map(title => title.textContent);
        deletedCards = [];

        cropTitles.forEach(title => {
            title.contentEditable = true;
            title.style.borderBottom = "1px dashed white";
            title.style.paddingBottom = "2px";
            title.style.textDecoration = "underline";
            title.addEventListener('input', enforceCharacterLimit);
            title.addEventListener('keydown', preventNewlines);
        });

        // Show remove buttons
        document.querySelectorAll('.remove-card').forEach(button => {
            button.style.display = "block";
            button.addEventListener('click', handleCardRemoval);
        });

    } else {
        // Attempting to exit edit mode
        const confirmed = confirm("Confirm changes to crops?");
        if (!confirmed) {
            // User cancelled — restore everything
            cropTitles.forEach((title, i) => {
                title.textContent = originalTitles[i];
            });

            disableEditMode(false); // Don't save
            return;
        }

        // User confirmed — save changes
        disableEditMode(true); // Save
    }

    // Update edit button appearance
    const editButton = document.getElementById('edit');
    if (editButton) {
        editButton.classList.toggle('active', isEditMode);
        editButton.innerHTML = isEditMode ?
            '<i class="fas fa-check"></i>' :
            '<i class="fas fa-edit"></i>';
    }
}

export function disableEditMode(save = true) {
    isEditMode = false;

    const cropTitles = document.querySelectorAll('.growth-cards .card:not(.add-card) h3');
    const removeButtons = document.querySelectorAll('.remove-card');

    cropTitles.forEach(title => {
        title.removeEventListener('input', enforceCharacterLimit);
        title.removeEventListener('keydown', preventNewlines);
        title.contentEditable = false;
        title.style.borderBottom = "none";
        title.style.paddingBottom = "0";
        title.style.textDecoration = "none";
    });

    removeButtons.forEach(button => {
        button.style.display = "none";
    });

    if (save) {
        // Save changes to backend
        saveCropTitlesToBackend(cropTitles);
        removeDeletedCropsFromBackend();
    }

    // Update edit button
    const editButton = document.getElementById('edit');
    if (editButton) {
        editButton.classList.remove('active');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
    }
}

// Save updated crop titles to backend
async function saveCropTitlesToBackend(cropTitles) {
    const token = localStorage.getItem('authToken');

    for (const title of cropTitles) {
        const card = title.closest('.card');
        const cropId = card.id;

        try {
            const response = await fetch(`https://whatever-qw7l.onrender.com/farms/crops/${cropId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: title.textContent.trim(),
                    growth_percent: 0,        // <-- Required by your backend
                    harvest_ready: false      // <-- Required by your backend
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error updating crop ${cropId}:`, errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log(`Crop ${cropId} updated successfully.`);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Delete removed crops from backend
async function removeDeletedCropsFromBackend() {
    const token = localStorage.getItem('authToken');

    for (const card of deletedCards) {
        const cropId = card.id;

        try {
            const response = await fetch(`https://whatever-qw7l.onrender.com/farms/crops/${cropId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error deleting crop ${cropId}:`, errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log(`Crop ${cropId} deleted successfully.`);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Enforce 20 character limit
function enforceCharacterLimit(e) {
    if (this.textContent.length > MAX_NAME_LENGTH) {
        this.textContent = this.textContent.substring(0, MAX_NAME_LENGTH);

        const range = document.createRange();
        range.selectNodeContents(this);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        showCharacterLimitWarning(this);
    }
}

// Prevent newlines
function preventNewlines(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
}

// Show warning for character limit
function showCharacterLimitWarning(element) {
    const warning = document.createElement('span');
    warning.textContent = 'Max 20 characters';
    warning.style.cssText = `
        position: absolute;
        background: #ff4444;
        color: white;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 12px;
        margin-top: 5px;
        z-index: 100;
    `;

    element.parentNode.appendChild(warning);

    setTimeout(() => {
        warning.remove();
    }, 2000);
}

// Handle card removal
function handleCardRemoval(e) {
    const card = e.target.closest('.card');
    deletedCards.push(card);
    card.style.display = "none"; // Hide instead of deleting immediately
}
