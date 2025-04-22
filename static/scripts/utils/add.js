// Import required functions
import { saveCardsToStorage } from './cardTransfer.js';
import { disableEditMode } from './edit_mode.js';
import { toggleEditMode } from './edit_mode.js';
const cropTypes = [
    { name: "Farm"}
];

const MAX_CROPS = 4;
let addCardBtn;

export function setupAddCard() {
    addCardBtn = document.getElementById('add-card');
    const container = document.querySelector('.growth-cards');
    
    if (!addCardBtn || !container) {
        console.error("Could not find required elements");
        return { createCropCard, MAX_CROPS, addCardBtn };
    }

    addCardBtn.addEventListener('click', () => {
        const currentCrops = container.querySelectorAll('.card:not(.add-card)');
        
        if (currentCrops.length >= MAX_CROPS) {
            addCardBtn.style.display = "none";
            return;
        }

        const randomCrop = cropTypes[Math.floor(Math.random() * cropTypes.length)];
        const newCard = createCropCard(randomCrop, container);
        container.insertBefore(newCard, addCardBtn);

        if (currentCrops.length + 1 >= MAX_CROPS) {
            addCardBtn.style.display = "none";
        }
        
        saveCardsToStorage();
    });

    return { createCropCard, MAX_CROPS, addCardBtn };
}

function createCropCard(crop, container, id = `crop-${Date.now()}`, progress = 0) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = id;
    card.innerHTML = `
        <h3 class="fas" tabindex="0">${crop.name}</h3>
        <button class="remove-card" style="display: none">
            <i class="fas fa-times"></i>
        </button>
        <div class="progress" style="--progress: ${progress}%">
            <span>${progress}% Growth</span>
        </div>
    `;
    disableEditMode();
    
    const removeBtn = card.querySelector('.remove-card');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.remove();
        saveCardsToStorage();           
        addCardBtn.style.display = "flex";
    });
    
    const title = card.querySelector('h3');
    title.focus();
    return card;
}