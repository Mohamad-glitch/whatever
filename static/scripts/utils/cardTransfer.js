let isLoadingFromStorage = false;

export async function saveCardsToStorage(cardData) {
    if (isLoadingFromStorage) return;

    const container = document.querySelector('.growth-cards');
    if (!container) return;

    const token = localStorage.getItem('authToken');

    try {
        // Prepare the body correctly
        const body = {
            name: cardData.name || "Unnamed Crop",
            growth_percent: cardData.growth_percent || 0,
            harvest_ready: cardData.harvest_ready || false
        };

        const response = await fetch(`https://whatever-qw7l.onrender.com/farms/crops`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Crop created successfully:', responseData);

    } catch (error) {
        console.error('Error saving card data:', error);
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
        // Ensure no duplicate cards
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
