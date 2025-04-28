// Import required functions
import { saveCardsToStorage } from './cardTransfer.js';

export const MAX_CROPS = 4; // Ensure MAX_CROPS is exported
let addCardBtn;
let oneTimeReload = false;
export function setupAddCard() {
    addCardBtn = document.getElementById('add-card');
    const container = document.querySelector('.growth-cards');

    if (!addCardBtn || !container) {
        console.error("Could not find required elements");
        return { createCropCard, MAX_CROPS, addCardBtn };
    }

    addCardBtn.addEventListener('click', () => {
        const currentCrops = container.querySelectorAll('.card:not(.add-card)');
        oneTimeReload = true;
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
    return { createCropCard, MAX_CROPS, addCardBtn };
}

function createCropCard(crop, container, progress = 0) {
    const card = document.createElement('div');
    card.className = 'card';
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
    removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        let id = card.id;
        if (confirm('Are you sure you want to remove this card?')) {
            try {
                const response = await fetch(`https://whatever-qw7l.onrender.com/farms/crops/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`},
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error deleting card:', errorText);
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                console.log(`Card with ID ${id} deleted successfully.`);
                card.remove();

                const currentCrops = container.querySelectorAll('.card:not(.add-card)');
                if (currentCrops.length < MAX_CROPS) {
                    addCardBtn.style.display = "flex";
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    const title = card.querySelector('h3');
    title.focus();
    if (oneTimeReload) {
        oneTimeReload = false;
        location.reload();
    }
    return card;
}