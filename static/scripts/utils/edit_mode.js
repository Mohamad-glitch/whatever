import { saveCardsToStorage } from './cardTransfer.js';

let isEditMode = false;
const MAX_NAME_LENGTH = 20; // Maximum allowed characters

export function toggleEditMode() {
    isEditMode = !isEditMode;
    const removeButtons = document.querySelectorAll('.remove-card');
    const cropTitles = document.querySelectorAll('.growth-cards .card:not(.add-card) h3');
    
    // Toggle remove buttons visibility
    removeButtons.forEach(button => {
        button.style.display = isEditMode ? "block" : "none";
    });

    // Remove existing event listeners first to avoid duplicates
    cropTitles.forEach(title => {
        title.removeEventListener('input', enforceCharacterLimit);
        title.removeEventListener('keydown', preventNewlines);
    });

    // Make card titles editable
    cropTitles.forEach(title => {
        if (isEditMode) {
            // Enable editing with character limit
            title.contentEditable = true;
            title.style.borderBottom = "1px dashed white";
            title.style.paddingBottom = "2px";
            title.style.textDecoration = "underline";
            
            // Add input handler for character limit
            title.addEventListener('input', enforceCharacterLimit);
            title.addEventListener('keydown', preventNewlines);
            
        } else {
            // Disable editing and remove handlers
            title.contentEditable = false;
            title.style.borderBottom = "none";
            title.style.paddingBottom = "0";
            title.style.textDecoration = "none";
            
            // Save all card data when exiting edit mode
            saveCardsToStorage();
        }
    });

    // Update edit button appearance
    const editButton = document.getElementById('edit');
    if (editButton) {
        editButton.classList.toggle('active', isEditMode);
        editButton.innerHTML = isEditMode ? 
            '<i class="fas fa-check"></i>' : 
            '<i class="fas fa-edit"></i>';
    }
}

export function disableEditMode() {
    isEditMode = false;
    const removeButtons = document.querySelectorAll('.remove-card');
    const cropTitles = document.querySelectorAll('.growth-cards .card:not(.add-card) h3');

    // Hide remove buttons
    removeButtons.forEach(button => {
        button.style.display = "none";
    });

    // Remove event listeners and disable editing
    cropTitles.forEach(title => {
        title.removeEventListener('input', enforceCharacterLimit);
        title.removeEventListener('keydown', preventNewlines);
        title.contentEditable = false;
        title.style.borderBottom = "none";
        title.style.paddingBottom = "0";
        title.style.textDecoration = "none";
    });

    // Save all card data when disabling edit mode
    saveCardsToStorage();

    // Update edit button appearance
    const editButton = document.getElementById('edit');
    if (editButton) {
        editButton.classList.remove('active');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
    }
}

// Enforce 20 character limit
function enforceCharacterLimit(e) {
    if (this.textContent.length > MAX_NAME_LENGTH) {
        this.textContent = this.textContent.substring(0, MAX_NAME_LENGTH);
        
        // Move cursor to end
        const range = document.createRange();
        range.selectNodeContents(this);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Optional: Show temporary warning
        showCharacterLimitWarning(this);
    }
}

// Prevent newlines/returns
function preventNewlines(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
}

// Show temporary warning
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
