export function simulateMangoGrowth() {

    const mangoProgress = document.querySelector('.mango-progress');
    const mangoText = mangoProgress.querySelector('span');
    let currentProgress = 0;
    
    const interval = setInterval(() => {
        const growth = Math.floor(Math.random() * 5) + 1;
        currentProgress = Math.min(currentProgress + growth, 100);
        
        // Update progress
        mangoProgress.style.setProperty('--progress', `${currentProgress}%`);
        mangoText.textContent = `${currentProgress}% Growth`;
        
        // Update classes based on progress
        mangoProgress.classList.remove('high-growth', 'peak-growth', 'harvest-ready');
        
        if (currentProgress >= 80) {
            mangoProgress.classList.add('peak-growth');
        } else if (currentProgress >= 60) {
            mangoProgress.classList.add('high-growth');
        }
        
        if (currentProgress >= 100) {
            clearInterval(interval);
            mangoProgress.classList.add('harvest-ready');
            mangoText.textContent = "Harvest Ready!";
        }
    }, 2000);
}