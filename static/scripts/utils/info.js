export function setupInfoCard() {

    const growthCards = document.querySelectorAll('.growth-cards .card:not(.add-card)');
    
    growthCards.forEach(card => {

        card.addEventListener('click', () => {
            const cropName = card.querySelector('h3').textContent;
            console.log(`Clicked on ${cropName} card`);
        });
    });
}