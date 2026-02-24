// Generación dinámica de tarjetas de viaje y filtros

document.addEventListener('DOMContentLoaded', () => {
    const tripsData = [
        {
            id: 'B001',
            title: 'Cartagena de Indias',
            location: 'Bolívar, Colombia',
            date: '2025-03-15',
            status: 'confirmed',
            price: 450000,
            image: '/Imagenes/cartagenaimg.jpg',
            rating: 4.9,
            description: 'Recorre las murallas y disfruta de playas caribeñas en esta histórica ciudad portuaria.'
        },
        {
            id: 'B002',
            title: 'Parque Tayrona',
            location: 'Magdalena, Colombia',
            date: '2025-03-20',
            status: 'pending',
            price: 320000,
            image: '/Imagenes/Tayrona.jpg',
            rating: 4.5,
            description: 'Aventura entre selvas y playas, ideal para caminatas y snorkel.'
        },
        {
            id: 'B003',
            title: 'Valle de Cocora',
            location: 'Quindío, Colombia',
            date: '2025-03-18',
            status: 'confirmed',
            price: 280000,
            image: '/Imagenes/valle-de-cocora.jpeg',
            rating: 4.8,
            description: 'Senderismo entre palmas de cera gigantes en un paisaje surrealista.'
        },
        {
            id: 'B004',
            title: 'Cartagena de Indias',
            location: 'Bolívar, Colombia',
            date: '2025-03-25',
            status: 'cancelled',
            price: 450000,
            image: '/Imagenes/cartagena.jpg',
            rating: 4.9,
            description: 'Reserva cancelada por cambio de planes.'
        }
    ];

    const grid = document.getElementById('tripsGrid');
    const filters = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('tripModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    function renderTrips(filterStatus = 'all') {
        grid.innerHTML = '';
        const filtered = tripsData.filter(t => filterStatus === 'all' || t.status === filterStatus);
        filtered.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'trip-card';
            card.innerHTML = `
                <div class="trip-image" style="background-image:url('${trip.image}')">
                    <div class="status-badge ${trip.status}">${trip.status === 'confirmed' ? 'Confirmada' : trip.status === 'pending' ? 'Pendiente' : 'Cancelada'}</div>
                </div>
                <div class="trip-content">
                    <span class="location-tag">${trip.location}</span>
                    <h3>${trip.title}</h3>
                    <p>Fecha de salida: <strong>${trip.date}</strong></p>
                    <p>ID de Reserva: <strong>${trip.id}</strong></p>
                    <p>Precio: <strong>$${trip.price.toLocaleString('es-CO')} COP</strong></p>
                    <div class="trip-footer">
                        <span>⭐ ${trip.rating}</span>
                        ${trip.status === 'pending' ? '<button class="btn-action pay-btn">Pagar Ahora</button>' : '<button class="btn-action view-btn">Ver Detalles</button>'}
                    </div>
                </div>
            `;

            // agregar listeners
            card.querySelector('.view-btn')?.addEventListener('click', () => showDetails(trip));
            card.querySelector('.pay-btn')?.addEventListener('click', () => alert('Redirigiendo al pago...'));

            grid.appendChild(card);
        });
    }

    function showDetails(trip) {
        modalBody.innerHTML = `
            <h2>${trip.title}</h2>
            <img src="${trip.image}" alt="${trip.title}" style="width:100%;border-radius:8px;margin-bottom:10px;">
            <p><strong>Ubicación:</strong> ${trip.location}</p>
            <p><strong>Fecha de salida:</strong> ${trip.date}</p>
            <p><strong>ID reserva:</strong> ${trip.id}</p>
            <p><strong>Precio:</strong> $${trip.price.toLocaleString('es-CO')} COP</p>
            <p><strong>Descripción:</strong> ${trip.description}</p>
        `;
        modal.setAttribute('aria-hidden', 'false');
    }

    closeModal.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
    });

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTrips(btn.dataset.status);
        });
    });

    // render inicial
    renderTrips();
});
