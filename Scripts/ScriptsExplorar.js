document.addEventListener('DOMContentLoaded', () => {
	const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
	if (!loggedUser) {
		window.location.href = '../index.html';
		return;
	}

	const initials = (loggedUser.username || loggedUser.email || 'U')
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
	const userInitials = document.getElementById('userInitials');
	if (userInitials) userInitials.textContent = initials;

	const destinationsGrid = document.getElementById('destinationsGrid');
	const searchInput = document.getElementById('searchInput');
	const searchButton = document.getElementById('searchButton');
	const filterButtons = document.querySelectorAll('.filter-btn');

	let destinations = [];
	let destinationModal;
	let destinationModalBody;

	function normalizePrice(value) {
		const number = Number(value);
		return Number.isFinite(number) ? number : 0;
	}

	function formatPrice(value) {
		return '$' + normalizePrice(value).toLocaleString('es-CO') + ' COP';
	}

	function getTripsKey() {
		const userId = loggedUser.userId || loggedUser.id;
		return `userTrips_${userId || loggedUser.email}`;
	}

	function getStoredTrips() {
		const stored = localStorage.getItem(getTripsKey());
		if (!stored) return [];
		try {
			return JSON.parse(stored);
		} catch {
			return [];
		}
	}

	function saveStoredTrips(list) {
		localStorage.setItem(getTripsKey(), JSON.stringify(list));
	}

	function ensureModal() {
		if (destinationModal) return;

		destinationModal = document.createElement('div');
		destinationModal.className = 'explore-modal';
		destinationModal.setAttribute('aria-hidden', 'true');
		destinationModal.innerHTML = `
			<div class="explore-modal-content">
				<button class="explore-modal-close" id="exploreModalClose">×</button>
				<div id="exploreModalBody"></div>
			</div>
		`;

		document.body.appendChild(destinationModal);
		destinationModalBody = document.getElementById('exploreModalBody');

		destinationModal.addEventListener('click', (e) => {
			if (e.target === destinationModal) closeModal();
		});

		document.getElementById('exploreModalClose').addEventListener('click', closeModal);
	}

	function closeModal() {
		if (!destinationModal) return;
		destinationModal.setAttribute('aria-hidden', 'true');
	}

	function addToMyTrips(destination) {
		const currentTrips = getStoredTrips();
		const alreadyExists = currentTrips.some((trip) => trip.sourceDestinationId === destination.id && trip.status === 'pending');

		if (alreadyExists) {
			alert('Este destino ya esta en Mis Viajes como pendiente.');
			return;
		}

		const departureDate = new Date();
		departureDate.setDate(departureDate.getDate() + 7);

		const pendingTrip = {
			id: `RES-${Date.now()}`,
			sourceDestinationId: destination.id,
			title: destination.title,
			location: destination.location,
			date: departureDate.toISOString().slice(0, 10),
			status: 'pending',
			price: normalizePrice(destination.price),
			image: destination.image,
			rating: destination.rating || 4.5,
			description: destination.description || 'Sin descripcion disponible.'
		};

		currentTrips.unshift(pendingTrip);
		saveStoredTrips(currentTrips);
		alert('Destino agregado a Mis Viajes en estado pendiente.');
	}

	function openDestinationDetails(destination) {
		ensureModal();
		destinationModalBody.innerHTML = `
			<div class="explore-detail-hero" style="background-image:url('${destination.image}')">
				<span class="explore-detail-chip">${(destination.categoria || 'destino').toUpperCase()}</span>
				<h2>${destination.title}</h2>
			</div>
			<div class="explore-detail-body">
				<p><strong>Ubicacion:</strong> ${destination.location}</p>
				<p><strong>Duracion:</strong> ${destination.duration || 'Por confirmar'}</p>
				<p><strong>Precio:</strong> ${formatPrice(destination.price)}</p>
				<p><strong>Descripcion:</strong> ${destination.description || 'Sin descripcion disponible.'}</p>
				<div class="explore-detail-actions">
					<button class="explore-secondary-btn" id="exploreCloseBtn">Cerrar</button>
					<button class="explore-primary-btn" id="exploreAddTripBtn">Agregar a Mis Viajes</button>
				</div>
			</div>
		`;

		destinationModal.setAttribute('aria-hidden', 'false');
		document.getElementById('exploreCloseBtn').addEventListener('click', closeModal);
		document.getElementById('exploreAddTripBtn').addEventListener('click', () => {
			addToMyTrips(destination);
			closeModal();
		});
	}

	function renderDestinations(list) {
		destinationsGrid.innerHTML = '';

		if (!list.length) {
			destinationsGrid.innerHTML = '<p style="padding:2rem; text-align:center; color:#888;">No encontramos destinos para los criterios de búsqueda.</p>';
			return;
		}

		list.forEach((destination) => {
			const card = document.createElement('div');
			card.className = 'destination-card explore-card';

			const desc = destination.description || '';
			const shortDesc = desc.length > 90 ? desc.slice(0, 90) + '...' : desc;
			const priceText = formatPrice(destination.price);

			card.innerHTML = '<div class="card-image" style="background-image: url(\'' + destination.image + '\');">'
				+ '<div class="card-rating">&#11088; ' + (destination.rating || '4.5') + '</div>'
				+ '<div class="duration-badge">' + (destination.duration || '') + '</div>'
				+ '</div>'
				+ '<div class="card-content">'
				+ '<h3 class="card-title">' + destination.title + '</h3>'
				+ '<p class="card-location">&#128205; ' + destination.location + '</p>'
				+ '<p style="font-size:.85rem;color:#666;margin:.3rem 0 .6rem;">' + shortDesc + '</p>'
				+ '<div class="card-footer">'
				+ '<div class="card-price">' + priceText + '</div>'
				+ '<button class="card-btn review-btn" data-id="' + destination.id + '">Revisar</button>'
				+ '</div>'
				+ '</div>';

			card.querySelector('.review-btn').addEventListener('click', () => openDestinationDetails(destination));
			destinationsGrid.appendChild(card);
		});
	}

	function applyFilter(token, activeBtn) {
		filterButtons.forEach((button) => button.classList.remove('active'));
		if (activeBtn) activeBtn.classList.add('active');

		if (!destinations.length) return;

		const filtered = token === 'todos'
			? destinations
			: destinations.filter((destination) => (destination.categoria || '').toLowerCase() === token);

		renderDestinations(filtered);
	}

	async function loadDestinations() {
		try {
			const response = await fetch('/destinos');
			if (!response.ok) throw new Error('No se pudo cargar destinos');

			destinations = await response.json();
			const allButton = document.querySelector('.filter-btn[data-filter="todos"]');
			if (allButton) allButton.classList.add('active');
			renderDestinations(destinations);
		} catch (error) {
			console.error('Error al cargar destinos:', error);
			destinationsGrid.innerHTML = '<p style="padding:1rem; text-align:center;">Error al cargar destinos desde el servidor.</p>';
		}
	}

	function runSearch() {
		const query = searchInput.value.trim().toLowerCase();
		if (!query) {
			renderDestinations(destinations);
			return;
		}

		const results = destinations.filter((destination) => {
			const title = (destination.title || '').toLowerCase();
			const location = (destination.location || '').toLowerCase();
			const category = (destination.categoria || '').toLowerCase();
			const description = (destination.description || '').toLowerCase();
			return title.includes(query) || location.includes(query) || category.includes(query) || description.includes(query);
		});

		renderDestinations(results);
	}

	searchButton.addEventListener('click', runSearch);
	searchInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') runSearch();
	});

	filterButtons.forEach((button) => {
		button.addEventListener('click', () => applyFilter(button.dataset.filter, button));
	});

	loadDestinations();
});
