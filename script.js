document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.calendar-container');
    const months = [
        "Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto",
        "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Parsear el archivo ICS
    fetch('basic.ics')
        .then(response => response.text())
        .then(data => {
            const parsedICS = ICAL.parse(data);
            const comp = new ICAL.Component(parsedICS);
            const vevents = comp.getAllSubcomponents('vevent');

            const festivos = vevents.map(event => {
                const date = event.getFirstPropertyValue('dtstart').toJSDate();
                return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            });

            // Generar el calendario
            const currentYear = new Date().getFullYear();
            months.forEach((monthName, monthIndex) => {
                const monthDiv = document.createElement('div');
                monthDiv.classList.add('month');

                // Encabezado del mes
                const header = document.createElement('div');
                header.classList.add('month-header');
                header.textContent = `${monthName} ${currentYear}`;
                monthDiv.appendChild(header);

                // Días del mes
                const daysDiv = document.createElement('div');
                daysDiv.classList.add('days');

                const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const dayDiv = document.createElement('div');
                    const date = new Date(currentYear, monthIndex, day);
                    const dateString = date.toISOString().split('T')[0];

                    dayDiv.classList.add('day');
                    dayDiv.textContent = day;

                    // Resaltar festivos
                    if (festivos.includes(dateString)) {
                        dayDiv.classList.add('festivo');
                    }

                    daysDiv.appendChild(dayDiv);
                }

                monthDiv.appendChild(daysDiv);
                container.appendChild(monthDiv);
            });
        });
});
