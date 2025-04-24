export const MAX_CROPS = 4;

export function setupAddCard(createCropCard, saveCardsToStorage) {
    const addCardBtn = document.getElementById('add-card');
    const container = document.querySelector('.growth-cards');
    const cropNameInput = document.getElementById('crop-name-input');

    if (!addCardBtn || !container || !cropNameInput) {
        console.error("Could not find required elements");
        return;
    }

    addCardBtn.addEventListener('click', () => {
        const currentCrops = container.querySelectorAll('.card:not(.add-card)');

        if (currentCrops.length >= MAX_CROPS) {
            addCardBtn.style.display = "none";
            return;
        }

        const cropName = cropNameInput.value.trim();
        if (!cropName) {
            alert("Please enter a crop name.");
            return;
        }

        const newCard = createCropCard({ name: cropName }, container);
        container.insertBefore(newCard, addCardBtn);

        cropNameInput.value = "";

        if (currentCrops.length + 1 >= MAX_CROPS) {
            addCardBtn.style.display = "none";
        }

        if (typeof saveCardsToStorage === 'function') {
            saveCardsToStorage();
        }
    });
}
