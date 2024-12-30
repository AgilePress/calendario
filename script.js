document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.calendar-container');
    const yearSelect = document.getElementById('year-select');
    const regionSelect = document.getElementById('region-select');

    const months = [
        "Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto",
        "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const currentYear = new Date().getFullYear();

    // Inicializar selectores
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }

    // Cargar festivos desde el archivo ICS
    fetch('basic.ics')
        .then(response => response.text())
        .then(data => {
            const parsedICS = ICAL.parse(data);
            const comp = new ICAL.Component(parsedICS);
            const vevents = comp.getAllSubcomponents('vevent');

            const festivos = vevents.map(event => {
                const summary = event.getFirstPropertyValue('summary');
                const start = event.getFirstPropertyValue('dtstart').toJSDate();
                const description = event.getFirstPropertyValue('description') || '';
                return { date: start, summary, description };
            });

            function updateCalendar() {
                const selectedYear = parseInt(yearSelect.value);
                const selectedRegion = regionSelect.value;

                const filteredFestivos = festivos.filter(festivo => {
                    const festivoYear = festivo.date.getFullYear();
                    const matchesYear = festivoYear === selectedYear;
                    const matchesRegion = selectedRegion === "all" || festivo.description.includes(selectedRegion);

                    return matchesYear && matchesRegion;
                });

                renderCalendar(filteredFestivos);
            }

            function renderCalendar(filteredFestivos) {
                container.innerHTML = '';

                months.forEach((monthName, monthIndex) => {
                    const monthDiv = document.createElement('div');
                    monthDiv.classList.add('month');

                    const header = document.createElement('div');
                    header.classList.add('month-header');
                    header.textContent = `${monthName} ${yearSelect.value}`;
                    monthDiv.appendChild(header);

                    const daysDiv = document.createElement('div');
                    daysDiv.classList.add('days');

                    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(currentYear, monthIndex, day);
                        const dateString = date.toISOString().split('T')[0];

                        const dayDiv = document.createElement('div');
                        dayDiv.classList.add('day');
                        dayDiv.textContent = day;

                        if (filteredFestivos.some(festivo => festivo.date.toISOString().split('T')[0] === dateString)) {
                            dayDiv.classList.add('festivo');
                        }

                        daysDiv.appendChild(dayDiv);
                    }

                    monthDiv.appendChild(daysDiv);
                    container.appendChild(monthDiv);
                });
            }

            yearSelect.addEventListener('change', updateCalendar);
            regionSelect.addEventListener('change', updateCalendar);

            updateCalendar();
        });
});
