document.addEventListener('DOMContentLoaded', () => {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }

    let tripsData = [];

    const modal = document.getElementById('destinationModal');
    const closeModal = document.getElementById('closeDestinationModal');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.btn-explore');
    const grid = document.getElementById('destinationsGrid');

    // 🔥 REFERENCIAS NUEVAS (IMPORTANTE)
    const modalTitle = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalDescription = document.getElementById('modalDescription');
    const modalDuration = document.getElementById('modalDuration');
    const modalPrice = document.getElementById('modalPrice');
    const modalRating = document.getElementById('modalRating');
    const modalImage = document.getElementById('modalImage');
    const btnReservar = document.getElementById('btnReservar');

    function getUserId() {
        return loggedUser.userId || loggedUser.id || '';
    }

    function formatPrice(value) {
        return value > 0
            ? '$' + Number(value).toLocaleString('es-CO') + ' COP'
            : 'Consultar precio';
    }

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
    function renderDestinations(list = tripsData) {
        grid.innerHTML = '';

        if (!list.length) {
            grid.innerHTML = '<div class="empty-message">No encontramos destinos para esa búsqueda.</div>';
            return;
        }

        list.forEach(trip => {

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

    function runSearch() {
        const query = String(searchInput?.value || '').trim().toLowerCase();

        if (!query) {
            renderDestinations();
            document.querySelector('.destinations-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        const filteredTrips = tripsData.filter((trip) => {
            return [trip.title, trip.location, trip.description, trip.duration]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });

        renderDestinations(filteredTrips);
        document.querySelector('.destinations-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function createReservation(trip) {
        const response = await fetch('/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: getUserId(),
                destinationId: trip.id
            })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'No se pudo crear la reserva.');
        }

        return result;
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
        modalPrice.textContent = formatPrice(trip.price);

        modalImage.style.backgroundImage = `url('${trip.image}')`;

        modal.setAttribute('aria-hidden', 'false');

        // BOTÓN RESERVAR
        btnReservar.onclick = async () => {
            btnReservar.disabled = true;
            btnReservar.textContent = 'Procesando...';

            try {
                await createReservation(trip);
                alert(`Reserva creada para ${trip.title}. La verás en Mis Viajes.`);
                modal.setAttribute('aria-hidden', 'true');
                window.location.href = 'MisViajes.html';
            } catch (error) {
                alert(error.message || 'No se pudo completar la reserva.');
            } finally {
                btnReservar.disabled = false;
                btnReservar.textContent = 'Reservar ahora';
            }
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

    searchButton?.addEventListener('click', runSearch);
    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearch();
        }
    });

    // INIT
    loadDestinations();
});