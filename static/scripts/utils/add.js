const cropTypes = [
    { name: "Tomato"},
    { name: "Lettuce"},
    { name: "Strawberry"},
    { name: "Blueberry"},
    { name: "Potato"},
    { name: "Carrot"}
];

const MAX_CROPS = 8; // Maximum number of crop cards allowed

export function setupAddCard() {
    const addCardBtn = document.getElementById('add-card');
    const container = document.querySelector('.growth-cards');
    
    addCardBtn.addEventListener('click', () => {
        const currentCrops = container.querySelectorAll('.card:not(.add-card)');
        // Remove the add button when reaching full capacity
        if(currentCrops.length + 1 == MAX_CROPS){
            addCardBtn.style.display = "none";
        }

        const randomCrop = cropTypes[Math.floor(Math.random() * cropTypes.length)];
        createCropCard(randomCrop, container);

    });
}

function createCropCard(crop, container) {
    const initialProgress = 0;
    const cardId = `crop-${Date.now()}`;
    
    const card = document.createElement('div');
    card.className = 'card';
    card.id = cardId;
    card.innerHTML = `
        <h3 class="fa-solid">${crop.name}</h3>
        <div class="progress" style="--progress: ${initialProgress}%">
            <span>${initialProgress}% Growth</span>
        </div>
    `;
    
    // Insert before the add button
    container.insertBefore(card, container.lastElementChild);
}