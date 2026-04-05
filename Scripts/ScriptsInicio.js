document.addEventListener('DOMContentLoaded', () => {

    let tripsData = [];

    const modal = document.getElementById('destinationModal');
    const closeModal = document.getElementById('closeDestinationModal');

    // 🔥 REFERENCIAS NUEVAS (IMPORTANTE)
    const modalTitle = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalDescription = document.getElementById('modalDescription');
    const modalDuration = document.getElementById('modalDuration');
    const modalPrice = document.getElementById('modalPrice');
    const modalRating = document.getElementById('modalRating');
    const modalImage = document.getElementById('modalImage');
    const btnReservar = document.getElementById('btnReservar');

    // ============================
    // CARGAR DESTINOS
    // ============================
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

            // fallback
            tripsData = [
                {
                    id: 'B001',
                    title: 'Cartagena de Indias',
                    location: 'Bolívar, Colombia',
                    price: 450000,
                    image: '/Imagenes/cartagenaimg.jpg',
                    rating: 4.9,
                    difficulty: 'FÁCIL',
                    duration: '3-4 DÍAS',
                    description: 'Explora las murallas coloniales y relájate en playas caribeñas.'
                }
            ];

            renderDestinations();
        }
    }

    // ============================
    // RENDER TARJETAS
    // ============================
    function renderDestinations() {
        const grid = document.getElementById('destinationsGrid');
        grid.innerHTML = '';

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
                        <div class="card-price">
                            ${trip.price > 0 ? '$' + trip.price.toLocaleString('es-CO') : 'Consultar'} 
                            <span class="currency">COP</span>
                        </div>
                        <button class="card-btn" data-id="${trip.id}">›</button>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        // EVENTOS
        document.querySelectorAll('.card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const trip = tripsData.find(t => t.id === id);
                if (trip) showDetails(trip);
            });
        });
    }

    // ============================
    // MOSTRAR DETALLE 
    // ============================
    function showDetails(trip) {

        modalTitle.textContent = trip.title;
        modalLocation.textContent = trip.location;
        modalDescription.textContent = trip.description;
        modalDuration.textContent = trip.duration;
        modalRating.textContent = trip.rating;

        modalPrice.textContent =
            trip.price > 0
                ? '$' + trip.price.toLocaleString('es-CO') + ' COP'
                : 'Consultar precio';

        modalImage.style.backgroundImage = `url('${trip.image}')`;

        modal.setAttribute('aria-hidden', 'false');

        // BOTÓN RESERVAR
        btnReservar.onclick = () => {
            alert(`Reserva confirmada para ${trip.title} 🎉`);
            modal.setAttribute('aria-hidden', 'true');
        };
    }

    // ============================
    // CERRAR MODAL
    // ============================
    closeModal.addEventListener('click', () => {
        modal.setAttribute('aria-hidden', 'true');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // INIT
    loadDestinations();
});