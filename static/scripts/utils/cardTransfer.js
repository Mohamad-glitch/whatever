let isLoadingFromStorage = false;

export async function saveCardsToStorage() {
    if (isLoadingFromStorage) return;

    const container = document.querySelector('.growth-cards');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card:not(.add-card)'));
    const cardsData = cards.map(card => {
        return {
            id: card.id,
            crop: card.querySelector('h3').textContent,
            progress: parseInt(card.querySelector('.progress span').textContent) || 0,
            timestamp: parseInt(card.id.split('-')[1]) || Date.now()
        };
    });

    // Save locally
    localStorage.setItem('savedCards', JSON.stringify(cardsData));

    const token = localStorage.getItem('authToken');

    // Send each card to the backend
    for (const card of cardsData) {
        const data = {
            name: card.crop,
            growth_percent: card.progress,
            harvest_ready: false
        };

        try {
            const response = await fetch('https://whatever-qw7l.onrender.com/farms/crops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Success:', responseData);

        } catch (error) {
            console.error('Error sending card data:', error);
        }
    }

    // Optional: redirect after saving all
    // window.location.href = "https://whatever-qw7l.onrender.com/";
}


export function loadCardsFromStorage(createCropCard, maxCrops, addCardBtn) {
    const container = document.querySelector('.growth-cards');
    if (!container) return;
    
    const savedCards = JSON.parse(localStorage.getItem('savedCards')) || [];
    
    // Flag we're loading
    isLoadingFromStorage = true;
    
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
    
    // Done loading
    isLoadingFromStorage = false;
    
    // Update add button visibility
    if (addCardBtn) {
        addCardBtn.style.display = savedCards.length >= maxCrops ? "none" : "flex";
    }
}