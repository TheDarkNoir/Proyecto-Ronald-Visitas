// Manejo de clic en destinos para mostrar detalle y permitir reserva

document.addEventListener('DOMContentLoaded', () => {
    let tripsData = []; // Se cargará dinámicamente

    // Función para cargar destinos desde la base de datos
    async function loadDestinations() {
        try {
            const response = await fetch('/destinos');
            if (!response.ok) {
                throw new Error('Error al cargar destinos');
            }
            tripsData = await response.json();
            renderDestinations();
        } catch (error) {
            console.error('Error cargando destinos:', error);
            // Fallback a datos hardcodeados si falla la carga
            tripsData = [
                {
                    id: 'B001',
                    title: 'Cartagena de Indias',
                    location: 'Bolívar, Colombia',
                    date: '',
                    status: '',
                    price: 450000,
                    image: '/Imagenes/cartagenaimg.jpg',
                    rating: 4.9,
                    difficulty: 'FÁCIL',
                    duration: '3-4 DÍAS',
                    description: 'Explora las murallas coloniales y relájate en playas caribeñas en esta joya caribeña.'
                },
                // ... otros destinos hardcodeados como fallback
            ];
            renderDestinations();
        }
    }

    // Función para renderizar las tarjetas de destinos
    function renderDestinations() {
        const grid = document.getElementById('destinationsGrid');
        grid.innerHTML = ''; // Limpiar contenido anterior

        tripsData.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'destination-card';
            card.innerHTML = `
                <div class="card-image" style="background-image: url('${trip.image}');">
                    <div class="card-rating">⭐ ${trip.rating}</div>
                    <div class="difficulty-badge ${trip.difficulty.toLowerCase()}">${trip.difficulty}</div>
                    <div class="duration-badge">${trip.duration}</div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${trip.title}</h3>
                    <p class="card-location">📍 ${trip.location}</p>
                    <div class="card-footer">
                        <div class="card-price">${trip.price > 0 ? '$' + trip.price.toLocaleString('es-CO') : 'Consultar precio'} <span class="currency">COP</span></div>
                        <button class="card-btn" data-trip-id="${trip.id}">›</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Agregar event listeners a los botones
        document.querySelectorAll('.card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tripId = e.target.getAttribute('data-trip-id');
                const trip = tripsData.find(t => t.id === tripId);
                if (trip) {
                    showDetails(trip);
                }
            });
        });
    }

    const modal = document.getElementById('destinationModal');
    const modalBody = document.getElementById('destinationModalBody');
    const closeModal = document.getElementById('closeDestinationModal');

    function showDetails(trip) {
        modalBody.innerHTML = `
            <h2>${trip.title}</h2>
            <img src="${trip.image}" alt="${trip.title}" style="width:100%;border-radius:8px;margin-bottom:10px;">
            <p><strong>Ubicación:</strong> ${trip.location}</p>
            <p><strong>Duración:</strong> ${trip.duration}</p>
            <p><strong>Dificultad:</strong> ${trip.difficulty}</p>
            <p><strong>Calificación:</strong> ⭐ ${trip.rating}</p>
            <p><strong>Precio:</strong> ${trip.price > 0 ? '$' + trip.price.toLocaleString('es-CO') + ' COP' : 'Consultar precio'}</p>
            <p><strong>Descripción:</strong> ${trip.description}</p>
            <button id="reserveBtn" class="btn-action">Reservar Viaje</button>
        `;
        modal.setAttribute('aria-hidden', 'false');

        document.getElementById('reserveBtn').addEventListener('click', () => {
            alert('¡Reserva confirmada! Gracias por elegir Tropical Travel.');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    closeModal.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
    });

    // Cargar destinos al iniciar
    loadDestinations();
});
