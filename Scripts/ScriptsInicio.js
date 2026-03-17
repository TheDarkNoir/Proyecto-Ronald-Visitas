// Manejo de clic en destinos para mostrar detalle y permitir reserva

document.addEventListener('DOMContentLoaded', () => {
    // información de los destinos (debe mantenerse sincronizada con el HTML estático)
    const tripsData = [
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
        {
            id: 'B002',
            title: 'Parque Tayrona',
            location: 'Magdalena, Colombia',
            date: '',
            status: '',
            price: 320000,
            image: '/Imagenes/Tayrona.jpg',
            rating: 4.5,
            difficulty: 'MODERADO',
            duration: '2-3 DÍAS',
            description: 'Aventura en selva y mar dentro del parque natural Tayrona con playas vírgenes.'
        },
        {
            id: 'B003',
            title: 'Valle de Cocora',
            location: 'Quindío, Colombia',
            date: '',
            status: '',
            price: 280000,
            image: '/Imagenes/valle-de-cocora.jpeg',
            rating: 4.8,
            difficulty: 'DIFÍCIL',
            duration: '1 DÍA',
            description: 'Senderismo entre palmas de cera gigantes en un paisaje surrealista lleno de niebla.'
        },
        {
            id: 'B004',
            title: 'Cañón del Chicamocha',
            location: 'Santander, Colombia',
            date: '',
            status: '',
            price: 390000,
            image: '/Imagenes/chicamocha.jpg',
            rating: 4.7,
            difficulty: 'MODERADO',
            duration: '2 DÍAS',
            description: 'Disfruta vistas panorámicas del cañón y actividades de aventura como parapente.'
        },
        {
            id: 'B005',
            title: 'Eje Cafetero',
            location: 'Risaralda, Colombia',
            date: '',
            status: '',
            price: 360000,
            image: '/Imagenes/eje cafe.jpg',
            rating: 4.6,
            difficulty: 'FÁCIL',
            duration: '2-3 DÍAS',
            description: 'Recorre fincas cafeteras, paisajes verdes y cultura tradicional del café.'
        },
        {
            id: 'B006',
            title: 'San Andrés Islas',
            location: 'San Andrés, Colombia',
            date: '',
            status: '',
            price: 520000,
            image: '/Imagenes/san andre.jpg',
            rating: 4.9,
            difficulty: 'FÁCIL',
            duration: '3-5 DÍAS',
            description: 'Playas de arena blanca, mar turquesa y vida marina espectacular.'
        }
    ];

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
            <p><strong>Precio:</strong> $${trip.price.toLocaleString('es-CO')} COP</p>
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

    function getLoggedUser() {
        return JSON.parse(localStorage.getItem('loggedUser') || 'null');
    }

    async function getUserTrips() {
        const user = getLoggedUser();
        if (!user) return [];

        try {
            const res = await fetch(`http://localhost:3000/mis-viajes?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const mappedTrips = data.map((r, i) => ({
                        id: r.id,
                        title: r.destinos?.nombre_destino || `Viaje ${i + 1}`,
                        location: r.destinos?.ubicacion || 'Colombia',
                        duration: r.destinos?.duracion || '??',
                        difficulty: 'MEDIA',
                        rating: 4.5,
                        description: r.destinos?.descripcion || 'Reserva',
                        price: r.precio_total || 0,
                        date: r.fecha_reserva || '',
                        status: r.estado || 'pending'
                    }));
                    localStorage.setItem(`userTrips_${user.id || user.email}`, JSON.stringify(mappedTrips));
                    return mappedTrips;
                }
            }
        } catch (e) {
            console.warn('No se pudo obtener viajes de la API', e);
        }

        const stored = localStorage.getItem(`userTrips_${user.id || user.email}`);
        if (stored) return JSON.parse(stored); 
 
        const baseline = user.email.includes('a') ? [
            {...tripsData[0], status:'confirmed', date:'2025-05-10'},
            {...tripsData[2], status:'pending', date:'2025-06-01'}
        ] : [
            {...tripsData[1], status:'confirmed', date:'2025-05-12'},
            {...tripsData[3], status:'pending', date:'2025-06-05'}
        ];
        localStorage.setItem(`userTrips_${user.id || user.email}`, JSON.stringify(baseline));
        return baseline;
    }

    async function saveUserTrip(trip) {
        const user = getLoggedUser();
        if (!user) return;
        try {
            await fetch('http://localhost:3000/reserva', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ usuario_id: user.id, destino_id: trip.id, fecha_reserva: new Date().toISOString().slice(0,10), precio_total: trip.price || 0 })
            });
        } catch (e) {
            console.warn('No se pudo guardar reserva en API', e);
        }

        const key = `userTrips_${user.id || user.email}`;
        let list = JSON.parse(localStorage.getItem(key) || '[]');
        const exists = list.some(t => t.id === trip.id && t.date === trip.date);
        if (!exists) {
            list.unshift({ ...trip, status: 'confirmed', date: new Date().toISOString().slice(0, 10) });
            localStorage.setItem(key, JSON.stringify(list));
        }
    }

    function showDetails(trip) {
        modalBody.innerHTML = `
            <h2>${trip.title}</h2>
            <img src="${trip.image}" alt="${trip.title}" style="width:100%;border-radius:8px;margin-bottom:10px;">
            <p><strong>Ubicación:</strong> ${trip.location}</p>
            <p><strong>Duración:</strong> ${trip.duration}</p>
            <p><strong>Dificultad:</strong> ${trip.difficulty}</p>
            <p><strong>Calificación:</strong> ⭐ ${trip.rating}</p>
            <p><strong>Precio:</strong> $${trip.price.toLocaleString('es-CO')} COP</p>
            <p><strong>Descripción:</strong> ${trip.description}</p>
            <button id="reserveBtn" class="btn-action">Reservar Viaje</button>
        `;
        modal.setAttribute('aria-hidden', 'false');

        document.getElementById('reserveBtn').addEventListener('click', () => {
            saveUserTrip(trip);
            alert('¡Reserva confirmada! Tu viaje se ha guardado en Mis Viajes.');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    // attach listener to each card
    const cards = document.querySelectorAll('.destination-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.card-title')?.textContent.trim();
            const trip = tripsData.find(t => t.title === title);
            if (trip) showDetails(trip);
        });
    });
});
