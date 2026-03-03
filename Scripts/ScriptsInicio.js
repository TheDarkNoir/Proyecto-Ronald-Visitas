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
