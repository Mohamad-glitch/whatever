export function simulateRealTimeData() {


    // Update soil temperature and pH randomly
    setInterval(() => {
        const tempElement = document.querySelector('.soil-stats .stat:first-child span:first-child');
        const moistureElement = document.querySelector('.soil-stats .stat:last-child span:first-child');
        
        if (tempElement && moistureElement) {
            const currentTemp = parseFloat(tempElement.textContent);
            const currentPh = parseFloat(moistureElement.textContent.replace('kPa', ''));
            
            const newTemp = (currentTemp + (Math.random() * 0.4 - 0.2)).toFixed(2);
            const newPh = (currentPh + (Math.random() * 0.9 - 0.3)).toFixed(1);
            
            tempElement.textContent = `${newTemp} °C`;
            moistureElement.textContent = `${newPh} kPa`;
        }
    }, 3000);
    
}