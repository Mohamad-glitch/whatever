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
        oneTimeReload = true;
        saveCardsToStorage(data);
    });

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

    removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        if (confirm('Are you sure you want to remove this card?')) {
            try {
                console.log('Deleting crop with ID:', id); // Debug log

                const response = await fetch(
                    `https://whatever-qw7l.onrender.com/farms/crops/${id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Full error response:', errorText);
                    throw new Error(`Delete failed: ${response.status}`);
                }

                card.remove();
                if (container.querySelectorAll('.card:not(.add-card)').length < MAX_CROPS) {
                    addCardBtn.style.display = "flex";
                }

            } catch (error) {
                console.error('Full error:', error);
                alert('Failed to delete crop. See console for details.');
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