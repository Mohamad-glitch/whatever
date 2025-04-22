export function saveCardsToStorage() {
    const container = document.querySelector('.growth-cards');
    if (!container) return;
    
    const cards = Array.from(container.querySelectorAll('.card:not(.add-card)'));
    const cardsData = cards.map(card => {
        return {
            id: card.id,
            name: card.querySelector('h3').textContent,
            progress: parseInt(card.querySelector('.progress span').textContent) || 0,
            timestamp: parseInt(card.id.split('-')[1]) || Date.now()
        };
    });
    
    localStorage.setItem('savedCards', JSON.stringify(cardsData));
}

export function loadCardsFromStorage(createCropCard, maxCrops, addCardBtn) {
    const container = document.querySelector('.growth-cards');
    if (!container) return;
    
    const savedCards = JSON.parse(localStorage.getItem('savedCards')) || [];
    
    // Clear existing cards except add button
    const existingCards = container.querySelectorAll('.card:not(.add-card)');
    existingCards.forEach(card => card.remove());
    
    // Load cards in original order
    savedCards
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(cardData => {
            const card = createCropCard(
                { name: cardData.name },
                container,
                cardData.id,
                cardData.progress
            );
            container.insertBefore(card, container.lastElementChild);
        });
    
    // Update add button visibility
    if (addCardBtn) {
        addCardBtn.style.display = savedCards.length >= maxCrops ? "none" : "flex";
    }
}