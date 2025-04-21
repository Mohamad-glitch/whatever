// Import simulation functions
import { simulateRealTimeData } from './utils/data_simulation.js';
import {simulateMangoGrowth} from './utils/progress.js';
import { setupAddCard} from './utils/add.js';
import { initCalendar } from './utils/calender.js';

document.addEventListener('DOMContentLoaded', function() {

    
    //adding cards 
    setupAddCard(); 
    
    // calender
    initCalendar();

    // mango progress bar test
    simulateMangoGrowth(); 
    
    // data changing
    simulateRealTimeData();
});

