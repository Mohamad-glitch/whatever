// Import required functions
import { saveCardsToStorage } from './cardTransfer.js';
const cropTypes = [
    { name: "Crops"}
];

export const MAX_CROPS = 4; // Ensure MAX_CROPS is exported
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

        const cropName = prompt("Enter the crop name:");
        if (!cropName || cropName.trim() === "") {
            alert("Crop name cannot be empty.");
            return;
        }

        const newCard = createCropCard({ name: cropName.trim() }, container);
        container.insertBefore(newCard, addCardBtn);
        const data = {
            name: cropName,
            growth_percent: 0,
            harvest_ready: false
        };

        if (currentCrops.length + 1 >= MAX_CROPS) {
            addCardBtn.style.display = "none";
        }
        
       saveCardsToStorage(data);
    });
    location.reload();
    return { createCropCard, MAX_CROPS, addCardBtn };
}

function createCropCard(crop, container, id = `crop-${Date.now()}`, progress = 0) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = id;
    card.innerHTML = `
        <h3 class="fas">${crop.name}</h3>
        <button class="remove-card" style="display: none">
            <i class="fas fa-times"></i>
        </button>
        <div class="progress" style="--progress: ${progress}%">
            <span>${progress}% Growth</span>
        </div>
    `;
    
    const removeBtn = card.querySelector('.remove-card');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (confirm('Are you sure you want to remove this card?')) {
            card.remove();
            const currentCrops = container.querySelectorAll('.card:not(.add-card)');
            if (currentCrops.length < MAX_CROPS) {
                addCardBtn.style.display = "flex";
            }
          //  saveCardsToStorage();
        }
    });
    
    const title = card.querySelector('h3');
    title.focus();
    return card;
}