export function initCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date();

    // Load marked dates from localStorage
    const markedDates = JSON.parse(localStorage.getItem('markedDates') || '{}');

    function renderCalendar() {
        calendarDays.innerHTML = '';

        // Format and display current month/year
        currentMonthElement.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(currentDate);

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDay = firstDayOfMonth.getDay();

        // Previous month's trailing days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = 0; i < startingDay; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'other-month');
            dayElement.textContent = prevMonthLastDay - startingDay + i + 1;
            calendarDays.appendChild(dayElement);
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day;

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            if (isToday) {
                dayElement.classList.add('today');
            }

            const dateKey = `${year}-${month + 1}-${day}`;
            if (markedDates[dateKey]) {
                dayElement.classList.add('has-data');
            }

            dayElement.addEventListener('click', () => {
                dayElement.classList.toggle('has-data');

                if (dayElement.classList.contains('has-data')) {
                    markedDates[dateKey] = true;
                } else {
                    delete markedDates[dateKey];
                }

                localStorage.setItem('markedDates', JSON.stringify(markedDates));
            });

            calendarDays.appendChild(dayElement);
        }

        // Fill remaining cells to complete the week grid
        const totalCells = startingDay + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);

        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.textContent = i;
                calendarDays.appendChild(dayElement);
            }
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initial render
    renderCalendar();
}
