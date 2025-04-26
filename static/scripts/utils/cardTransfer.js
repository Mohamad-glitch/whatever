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

    const token = localStorage.getItem('authToken');

    for (const card of cardsData) {
        const data = {
            name: card.crop,
            growth_percent: card.progress,
            harvest_ready: false
        };

        try {
            const response = await fetch(`https://whatever-qw7l.onrender.com/farms/crops`, { 
                method: 'PUT', // Update existing card instead of creating a new ones with POST
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log('Card updated successfully:', card.id);

        } catch (error) {
            console.error('Error updating card data:', error);
        }
    }

}

export function loadCardsFromStorage(createCropCard, maxCrops, addCardBtn) {
    const container = document.querySelector('.growth-cards');
    if (!container) return;

    const token = localStorage.getItem('authToken');

    isLoadingFromStorage = true;

    const existingCards = container.querySelectorAll('.card:not(.add-card)');
    existingCards.forEach(card => card.remove());

    fetch('https://whatever-qw7l.onrender.com/farms/crops', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(cardsData => {
            // Ensure no duplicate cards are created
            const uniqueCards = new Map();
            cardsData.forEach(card => uniqueCards.set(card.id, card));

            // Load cards in original order
            Array.from(uniqueCards.values())
                .sort((a, b) => a.timestamp - b.timestamp)
                .forEach(cardData => {
                    const card = createCropCard(
                        { name: cardData.name },
                        container,
                        cardData.id,
                        cardData.growth_percent
                    );
                    container.insertBefore(card, container.lastElementChild);
                });

            // Update add button visibility
            if (addCardBtn) {
                addCardBtn.style.display = cardsData.length >= maxCrops ? "none" : "flex";
            }
        })
        .catch(error => {
            console.error('Error loading cards from backend:', error);
        })
        .finally(() => {
            isLoadingFromStorage = false;
        });
}