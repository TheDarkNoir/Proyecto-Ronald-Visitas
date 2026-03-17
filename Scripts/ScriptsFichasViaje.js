// Generación dinámica de tarjetas de viaje y filtros (datos por usuario)

document.addEventListener('DOMContentLoaded', () => {
    const baseTrips = [
        {
            id: 'B001',
            title: 'Cartagena de Indias',
            location: 'Bolívar, Colombia',
            price: 450000,
            image: '/Imagenes/cartagenaimg.jpg',
            rating: 4.9,
            description: 'Recorre las murallas y disfruta de playas caribeñas en esta histórica ciudad portuaria.'
        },
        {
            id: 'B002',
            title: 'Parque Tayrona',
            location: 'Magdalena, Colombia',
            price: 320000,
            image: '/Imagenes/Tayrona.jpg',
            rating: 4.5,
            description: 'Aventura entre selvas y playas, ideal para caminatas y snorkel.'
        },
        {
            id: 'B003',
            title: 'Valle de Cocora',
            location: 'Quindío, Colombia',
            price: 280000,
            image: '/Imagenes/valle-de-cocora.jpeg',
            rating: 4.8,
            description: 'Senderismo entre palmas de cera gigantes en un paisaje surrealista.'
        },
        {
            id: 'B004',
            title: 'Cañón del Chicamocha',
            location: 'Santander, Colombia',
            price: 390000,
            image: '/Imagenes/chicamocha.jpg',
            rating: 4.7,
            description: 'Disfruta vistas panorámicas del cañón y actividades de aventura como parapente.'
        }
    ];

    const grid = document.getElementById('tripsGrid');
    const filters = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('tripModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }

    const tripsKey = `userTrips_${loggedUser.id || loggedUser.email}`;

    async function loadUserTrips() {
        try {
            const response = await fetch(`http://localhost:3000/mis-viajes?userId=${loggedUser.id}`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length) {
                    const mapped = data.map((r, i) => ({
                        id: r.id,
                        title: r.destinos?.nombre_destino || `Viaje ${i + 1}`,
                        location: r.destinos?.ubicacion || 'Colombia',
                        date: r.fecha_reserva || 'Próxima',
                        status: r.estado || 'pending',
                        price: r.precio_total || 0,
                        image: r.destinos?.imagen || '/Imagenes/cartagenaimg.jpg',
                        rating: 4.5,
                        description: r.destinos?.descripcion || 'Reserva de viaje'
                    }));
                    localStorage.setItem(tripsKey, JSON.stringify(mapped));
                    return mapped;
                }
            }
        } catch (e) {
            console.warn('No se pudo cargar viajes desde la API', e);
        }

        const stored = localStorage.getItem(tripsKey);
        if (stored) {
            return JSON.parse(stored);
        }

        const userTrips = loggedUser.email && loggedUser.email.includes('a')
            ? [
                { ...baseTrips[0], date: '2025-03-15', status: 'confirmed' },
                { ...baseTrips[2], date: '2025-04-01', status: 'pending' }
            ]
            : [
                { ...baseTrips[1], date: '2025-03-20', status: 'confirmed' },
                { ...baseTrips[3], date: '2025-04-10', status: 'cancelled' }
            ];

        localStorage.setItem(tripsKey, JSON.stringify(userTrips));
        return userTrips;
    }

    function saveUserTrips(list) {
        localStorage.setItem(tripsKey, JSON.stringify(list));
    }

    let tripsData = [];
    loadUserTrips().then(data => { tripsData = data; renderTrips(); });


    function renderTrips(filterStatus = 'all') {
        grid.innerHTML = '';
        const filtered = tripsData.filter(t => filterStatus === 'all' || t.status === filterStatus);
        if (!filtered.length) {
            grid.innerHTML = '<div class="empty-message">No tienes viajes en este estado aún.</div>';
            return;
        }

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
                    <p>Fecha de salida: <strong>${trip.date || 'Próximamente'}</strong></p>
                    <p>Reserva: <strong>${trip.id}</strong></p>
                    <p>Precio: <strong>$${trip.price.toLocaleString('es-CO')} COP</strong></p>
                    <div class="trip-footer">
                        <span>⭐ ${trip.rating}</span>
                        <button class="btn-action view-btn">Ver Detalles</button>
                    </div>
                </div>
            `;

            card.querySelector('.view-btn').addEventListener('click', () => showDetails(trip));
            grid.appendChild(card);
        });
    }

    function showDetails(trip) {
        modalBody.innerHTML = `
            <h2>${trip.title}</h2>
            <img src="${trip.image}" alt="${trip.title}" style="width:100%;border-radius:8px;margin-bottom:10px;">
            <p><strong>Ubicación:</strong> ${trip.location}</p>
            <p><strong>Fecha de salida:</strong> ${trip.date || 'Próximamente'}</p>
            <p><strong>ID reserva:</strong> ${trip.id}</p>
            <p><strong>Precio:</strong> $${trip.price.toLocaleString('es-CO')} COP</p>
            <p><strong>Descripción:</strong> ${trip.description}</p>
            <button id="confirmBtn" class="btn-action">Marcar como completado</button>
        `;
        modal.setAttribute('aria-hidden', 'false');

        document.getElementById('confirmBtn').addEventListener('click', () => {
            tripsData = tripsData.map(t => t.id === trip.id ? { ...t, status: 'confirmed' } : t);
            saveUserTrips(tripsData);
            renderTrips(document.querySelector('.filter-btn.active')?.dataset.status || 'all');
            modal.setAttribute('aria-hidden', 'true');
            alert('¡Listo! Este viaje se marcó como confirmado para ti.');
        });
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
});
