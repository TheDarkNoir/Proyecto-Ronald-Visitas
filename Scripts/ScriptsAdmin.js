document.addEventListener('DOMContentLoaded', () => {
    function safeJsonParse(value, fallback = null) {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    const loggedUser = safeJsonParse(localStorage.getItem('loggedUser') || 'null', null);
    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }

    const adminId = loggedUser.userId || loggedUser.id || '';
    const adminRole = String(loggedUser.rol || '').toLowerCase();
    if (!adminId || adminRole !== 'admin') {
        window.location.href = 'Inicio.html';
        return;
    }

    const elements = {
        navLinks: Array.from(document.querySelectorAll('.nav-link')),
        navItems: Array.from(document.querySelectorAll('.nav-item')),
        views: Array.from(document.querySelectorAll('.admin-view')),
        alertsList: document.getElementById('alertsList'),
        inventoryTableBody: document.getElementById('inventoryTableBody'),
        usersTableBody: document.getElementById('usersTableBody'),
        operationsTableBody: document.getElementById('operationsTableBody'),
        inventorySearchInput: document.getElementById('inventorySearchInput'),
        inventoryStatusFilter: document.getElementById('inventoryStatusFilter'),
        usersSearchInput: document.getElementById('usersSearchInput'),
        usersRoleFilter: document.getElementById('usersRoleFilter'),
        operationsSearchInput: document.getElementById('operationsSearchInput'),
        operationsStatusFilter: document.getElementById('operationsStatusFilter'),
        transactionsList: document.getElementById('transactionsList'),
        ratingDist: document.getElementById('ratingDist'),
        reviewsList: document.getElementById('reviewsList'),
        filterDest: document.getElementById('filterDest'),
        expenseBreakdown: document.getElementById('expenseBreakdown'),
        modalOverlay: document.getElementById('modalOverlay'),
        modal: document.getElementById('modal'),
        toastWrap: document.getElementById('toastWrap'),
        adminRefreshBtn: document.getElementById('adminRefreshBtn'),
        newDestinationBtn: document.getElementById('newDestinationBtn'),
        newUserBtn: document.getElementById('newUserBtn'),
        saveSettingsBtn: document.getElementById('saveSettings'),
        logoutAdminBtn: document.getElementById('logoutAdminBtn'),
        viewCalendarBtn: document.getElementById('viewCalendarBtn'),
        genReportBtn: document.getElementById('genReportBtn'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        systemStatusCards: document.getElementById('systemStatusCards')
    };

    const state = {
        panel: null,
        salesChart: null,
        cashChart: null,
        currentExperienceFilter: 'all',
        filters: {
            inventoryQuery: '',
            inventoryStatus: 'all',
            usersQuery: '',
            usersRole: 'all',
            operationsQuery: '',
            operationsStatus: 'all'
        }
    };

    function normalizeText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getFilteredInventoryRows() {
        const rows = state.panel?.inventory?.destinations || [];
        const query = normalizeText(state.filters.inventoryQuery);
        const status = state.filters.inventoryStatus;

        return rows.filter((row) => {
            const matchesStatus = status === 'all' || row.status === status;
            const haystack = [row.name, row.location, row.category, row.city, row.country].map(normalizeText).join(' ');
            const matchesQuery = !query || haystack.includes(query);
            return matchesStatus && matchesQuery;
        });
    }

    function getFilteredUserRows() {
        const rows = state.panel?.users?.records || [];
        const query = normalizeText(state.filters.usersQuery);
        const role = state.filters.usersRole;

        return rows.filter((row) => {
            const matchesRole = role === 'all' || row.role === role;
            const haystack = [row.name, row.email, row.city, row.country, row.status].map(normalizeText).join(' ');
            const matchesQuery = !query || haystack.includes(query);
            return matchesRole && matchesQuery;
        });
    }

    function getFilteredOperationRows() {
        const rows = state.panel?.operations?.reservations || [];
        const query = normalizeText(state.filters.operationsQuery);
        const status = state.filters.operationsStatus;

        return rows.filter((row) => {
            const matchesStatus = status === 'all' || row.status === status;
            const haystack = [row.id, row.customer, row.customerEmail, row.destination, row.date].map(normalizeText).join(' ');
            const matchesQuery = !query || haystack.includes(query);
            return matchesStatus && matchesQuery;
        });
    }

    function getApiBaseCandidates() {
        const candidates = [];
        const currentOrigin = window.location.origin;
        const hostname = window.location.hostname || 'localhost';
        const protocol = /^https?:/i.test(window.location.protocol) ? window.location.protocol : 'http:';

        if (/^https?:/i.test(window.location.protocol) && currentOrigin && currentOrigin !== 'null') {
            candidates.push(currentOrigin);
        }

        ['5501', '5502', '5503'].forEach((port) => {
            const candidate = `${protocol}//${hostname}:${port}`;
            if (!candidates.includes(candidate)) {
                candidates.push(candidate);
            }
        });

        return candidates;
    }

    async function fetchApi(path, options = {}) {
        let lastError = null;
        const token = localStorage.getItem('authToken') || '';
        const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

        for (const base of getApiBaseCandidates()) {
            try {
                const mergedOptions = {
                    ...options,
                    headers: {
                        ...authHeader,
                        ...(options.headers || {})
                    }
                };
                const response = await fetch(`${base}${path}`, mergedOptions);
                if (response.status === 401) {
                    localStorage.removeItem('loggedUser');
                    localStorage.removeItem('authToken');
                    window.location.href = '../index.html';
                    return response;
                }
                if (response.status === 404) {
                    continue;
                }
                return response;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('No fue posible conectar con el servidor.');
    }

    async function apiRequest(path, options = {}) {
        const response = await fetchApi(path, options);
        const data = safeJsonParse(await response.text(), {});
        if (!response.ok) {
            throw new Error(data.error || data.message || 'No se pudo completar la operación.');
        }
        return data;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function formatCompactCurrency(value) {
        const amount = Number(value) || 0;
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
        return formatCurrency(amount);
    }

    function formatDate(value) {
        const date = value ? new Date(value) : null;
        if (!date || Number.isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showToast(message, type = 'info') {
        if (!elements.toastWrap) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        elements.toastWrap.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 250);
        }, 2800);
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) node.textContent = value;
    }

    function showView(targetId) {
        elements.views.forEach((view) => {
            view.classList.toggle('active', view.id === targetId);
        });
        elements.navItems.forEach((item) => {
            const link = item.querySelector('.nav-link');
            item.classList.toggle('active', link?.getAttribute('href') === `#${targetId}`);
        });
    }

    function openModal(content) {
        if (!elements.modalOverlay || !elements.modal) return;
        elements.modal.innerHTML = content;
        elements.modalOverlay.style.display = 'flex';
        elements.modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        if (!elements.modalOverlay || !elements.modal) return;
        elements.modalOverlay.style.display = 'none';
        elements.modal.setAttribute('aria-hidden', 'true');
        elements.modal.innerHTML = '';
    }

    function bindModalDismiss() {
        elements.modalOverlay?.addEventListener('click', (event) => {
            if (event.target === elements.modalOverlay || event.target.closest('[data-close-modal]')) {
                closeModal();
            }
        });
    }

    function renderEmptyPanel(title, description) {
        return `
            <div class="empty-panel">
                <div class="empty-title">${escapeHtml(title)}</div>
                <div class="empty-desc">${escapeHtml(description)}</div>
            </div>
        `;
    }

    function renderDashboard() {
        if (!state.panel) return;
        const metrics = state.panel.dashboard.metrics;
        setText('metricSalesToday', formatCompactCurrency(metrics.salesToday));
        setText('metricActiveReservations', String(metrics.activeReservations || 0));
        setText('metricNewTourists', String(metrics.newTourists || 0));
        setText('metricGlobalRating', Number(metrics.ratingGlobal || 0).toFixed(2));

        if (elements.alertsList) {
            elements.alertsList.innerHTML = state.panel.dashboard.alerts.map((alert) => `
                <article class="alert-item alert-${escapeHtml(alert.type)}">
                    <div>
                        <strong>${escapeHtml(alert.title)}</strong>
                        <p>${escapeHtml(alert.message)}</p>
                    </div>
                    <span class="pill">${escapeHtml(alert.action)}</span>
                </article>
            `).join('');
        }

        const salesCanvas = document.getElementById('salesChart');
        if (salesCanvas && window.Chart) {
            state.salesChart?.destroy();
            state.salesChart = new Chart(salesCanvas, {
                type: 'line',
                data: {
                    labels: state.panel.dashboard.salesTrend.map((item) => item.label),
                    datasets: [{
                        label: 'Ventas',
                        data: state.panel.dashboard.salesTrend.map((item) => item.total),
                        borderColor: '#ff7a59',
                        backgroundColor: 'rgba(255, 122, 89, 0.12)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4,
                        pointBackgroundColor: '#ff7a59'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }

    function renderInventory() {
        if (!state.panel || !elements.inventoryTableBody) return;
        const inventory = state.panel.inventory;
        const rows = getFilteredInventoryRows();
        setText('inventoryActiveCount', String(inventory.metrics.active || 0));
        setText('inventoryDraftCount', String(inventory.metrics.drafts || 0));
        setText('inventoryFullCount', String(inventory.metrics.full || 0));

        if (!inventory.destinations.length) {
            elements.inventoryTableBody.innerHTML = renderEmptyPanel('Sin destinos', 'Aún no hay destinos cargados en la base de datos.');
            return;
        }

        if (!rows.length) {
            elements.inventoryTableBody.innerHTML = renderEmptyPanel('Sin coincidencias', 'No encontramos destinos con ese criterio de búsqueda o filtro.');
            return;
        }

        elements.inventoryTableBody.innerHTML = rows.map((row) => `
            <div class="table-row">
                <div class="col destino usuario">
                    <img class="thumb" src="${escapeHtml(row.image)}" alt="${escapeHtml(row.name)}">
                    <div class="dest-text">
                        <strong>${escapeHtml(row.name)}</strong>
                        <small>${escapeHtml(row.location)}</small>
                    </div>
                </div>
                <div class="col categoria"><span class="pill">${escapeHtml(row.category)}</span></div>
                <div class="col precio">${formatCurrency(row.price)}</div>
                <div class="col rating">${Number(row.rating || 0).toFixed(1)}</div>
                <div class="col estado"><span class="status-badge ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></div>
                <div class="col acciones">
                    <button class="icon" data-action="edit-destination" data-id="${escapeHtml(row.id)}">✏️</button>
                    <button class="icon" data-action="delete-destination" data-id="${escapeHtml(row.id)}">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function renderUsers() {
        if (!state.panel || !elements.usersTableBody) return;
        const users = state.panel.users;
        const rows = getFilteredUserRows();
        setText('usersTotalCount', String(users.metrics.total || 0));
        setText('usersClientsCount', String(users.metrics.clients || 0));
        setText('usersAdminsCount', String(users.metrics.admins || 0));
        setText('usersActiveCount', String(users.metrics.active || 0));

        if (!users.records.length) {
            elements.usersTableBody.innerHTML = renderEmptyPanel('Sin usuarios', 'No hay usuarios registrados en la base de datos.');
            return;
        }

        if (!rows.length) {
            elements.usersTableBody.innerHTML = renderEmptyPanel('Sin coincidencias', 'No encontramos usuarios con ese criterio de búsqueda o filtro.');
            return;
        }

        elements.usersTableBody.innerHTML = rows.map((row) => `
            <div class="table-row">
                <div class="col usuario">
                    <span class="user-avatar">${escapeHtml(row.initials)}</span>
                    <div class="dest-text">
                        <strong>${escapeHtml(row.name)}</strong>
                        <small>${escapeHtml(row.email)}</small>
                    </div>
                </div>
                <div class="col rol"><span class="pill ${row.role === 'admin' ? 'admin' : ''}">${escapeHtml(row.role)}</span></div>
                <div class="col reservas">${row.reservas}</div>
                <div class="col gastado">${formatCurrency(row.spent)}</div>
                <div class="col ingreso">${escapeHtml(formatDate(row.joinedAt))}</div>
                <div class="col estado"><span class="status-badge ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></div>
                <div class="col acciones">
                    <button class="icon" data-action="edit-user" data-id="${escapeHtml(row.id)}">✏️</button>
                    <button class="icon" data-action="delete-user" data-id="${escapeHtml(row.id)}">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function renderOperations() {
        if (!state.panel || !elements.operationsTableBody) return;
        const operations = state.panel.operations;
        const rows = getFilteredOperationRows();
        setText('operationsConfirmedCount', String(operations.metrics.confirmed || 0));
        setText('operationsPendingCount', String(operations.metrics.pending || 0));
        setText('operationsCancelledCount', String(operations.metrics.cancelled || 0));
        setText('operationsTravelersCount', String(operations.metrics.travelers || 0));

        if (!operations.reservations.length) {
            elements.operationsTableBody.innerHTML = renderEmptyPanel('Sin reservas', 'No hay reservaciones registradas para operar.');
            return;
        }

        if (!rows.length) {
            elements.operationsTableBody.innerHTML = renderEmptyPanel('Sin coincidencias', 'No encontramos reservas con ese criterio de búsqueda o filtro.');
            return;
        }

        elements.operationsTableBody.innerHTML = rows.map((row) => `
            <div class="table-row">
                <div class="col id">${escapeHtml(row.id.slice(0, 8))}</div>
                <div class="col cliente">
                    <strong>${escapeHtml(row.customer)}</strong>
                    <small>${escapeHtml(row.customerEmail)}</small>
                </div>
                <div class="col destino">${escapeHtml(row.destination)}</div>
                <div class="col fecha">${escapeHtml(formatDate(row.date))}</div>
                <div class="col viajeros">${row.travelers}</div>
                <div class="col total">${formatCurrency(row.total)}</div>
                <div class="col estado"><span class="status-badge ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></div>
                <div class="col acciones">
                    <button class="icon" data-action="status-reservation" data-id="${escapeHtml(row.id)}" data-status="confirmed" title="Confirmar">✅</button>
                    <button class="icon" data-action="status-reservation" data-id="${escapeHtml(row.id)}" data-status="cancelled" title="Cancelar">❌</button>
                </div>
            </div>
        `).join('');
    }

    function renderFinance() {
        if (!state.panel) return;
        const finance = state.panel.finance;
        setText('financeIncome', formatCompactCurrency(finance.metrics.income));
        setText('financeExpenses', formatCompactCurrency(finance.metrics.expenses));
        setText('financeBenefit', formatCompactCurrency(finance.metrics.benefit));
        setText('financeReports', String(finance.metrics.reports || 0));

        if (elements.expenseBreakdown) {
            elements.expenseBreakdown.innerHTML = finance.expensesBreakdown.map((item) => `
                <div class="progress-row">
                    <span class="label">${escapeHtml(item.label)}</span>
                    <div class="bar-wrap"><div class="bar" style="width: 100%; background:${escapeHtml(item.color)}"></div></div>
                    <span class="value">${formatCurrency(item.value)}</span>
                </div>
            `).join('');
        }

        if (elements.transactionsList) {
            elements.transactionsList.innerHTML = finance.transactions.length
                ? finance.transactions.map((tx) => `
                    <article class="transaction">
                        <div class="left">
                            <strong>${escapeHtml(tx.concept)}</strong>
                            <small>${escapeHtml(tx.detail)} · ${escapeHtml(formatDate(tx.date))}</small>
                        </div>
                        <div class="right">
                            <div class="tx-amount ${escapeHtml(tx.type)}">${formatCurrency(tx.amount)}</div>
                            <span class="tx-status">${escapeHtml(tx.status)}</span>
                        </div>
                    </article>
                `).join('')
                : renderEmptyPanel('Sin transacciones', 'Todavía no hay movimientos para mostrar.');
        }

        const cashCanvas = document.getElementById('cashChart');
        if (cashCanvas && window.Chart) {
            state.cashChart?.destroy();
            state.cashChart = new Chart(cashCanvas, {
                type: 'bar',
                data: {
                    labels: finance.cashflow.map((item) => item.label),
                    datasets: [{
                        label: 'Ingreso confirmado',
                        data: finance.cashflow.map((item) => item.total),
                        backgroundColor: '#1e3a8a',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }

    function renderExperienceItems() {
        if (!state.panel || !elements.reviewsList) return;
        const items = state.panel.experience.items.filter((item) => {
            return state.currentExperienceFilter === 'all' || item.id === state.currentExperienceFilter;
        });

        const header = '<h3>Destinos Monitoreados</h3>';
        if (!items.length) {
            elements.reviewsList.innerHTML = header + renderEmptyPanel('Sin resultados', 'No hay destinos para el filtro seleccionado.');
            return;
        }

        elements.reviewsList.innerHTML = header + items.map((item) => `
            <article class="review-card">
                <div class="review-left">
                    <div class="review-avatar">${escapeHtml(item.title.slice(0, 2).toUpperCase())}</div>
                    <div class="review-body">
                        <strong>${escapeHtml(item.title)} <span class="star-inline">★ ${Number(item.rating || 0).toFixed(1)}</span></strong>
                        <small>${escapeHtml(item.location)} · ${item.reservations} reservas</small>
                        <p class="review-text">${escapeHtml(item.summary)}</p>
                    </div>
                </div>
                <div class="review-actions">
                    <span class="publish-badge">${escapeHtml(item.status)}</span>
                </div>
            </article>
        `).join('');
    }

    function renderExperience() {
        if (!state.panel) return;
        const experience = state.panel.experience;
        setText('avgRating', Number(experience.metrics.avgRating || 0).toFixed(1));
        setText('totalReviews', String(experience.metrics.totalSignals || 0));
        setText('publishedCount', String(experience.metrics.activeDestinations || 0));
        setText('pendingCount', String(experience.metrics.inactiveDestinations || 0));

        if (elements.filterDest) {
            const options = ['<option value="all">Todos los destinos</option>'].concat(
                experience.items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`)
            );
            elements.filterDest.innerHTML = options.join('');
            elements.filterDest.value = state.currentExperienceFilter;
        }

        if (elements.ratingDist) {
            elements.ratingDist.innerHTML = experience.distribution.map((item) => `
                <div class="dist-row">
                    <div class="dist-label">${item.rating}★</div>
                    <div class="dist-bar"><div class="dist-fill" style="width:${item.percent}%"></div></div>
                    <div class="dist-percent">${item.percent}%</div>
                </div>
            `).join('');
        }

        renderExperienceItems();
    }

    function renderConfig() {
        if (!state.panel) return;
        const admin = state.panel.config.admin || {};
        const system = state.panel.config.system || {};

        setText('adminSidebarName', admin.nombre || loggedUser.username || 'Administrador');
        setText('adminSidebarRole', String(admin.rol || 'admin').toUpperCase());
        setText('adminSidebarAvatar', (admin.nombre || admin.email || 'AD').slice(0, 2).toUpperCase());
        setText('adminHeaderTitle', `Panel de Control ${admin.pais || 'General'}`);
        setText('adminHeaderSubtitle', `Estado general de reservas, usuarios y destinos en ${admin.pais || 'Colombia'}.`);
        setText('adminHubLabel', `${admin.ciudad || 'Hub'} · ${admin.pais || 'Colombia'}`);

        const adminName = document.getElementById('adminName');
        const adminEmail = document.getElementById('adminEmail');
        const adminPhone = document.getElementById('adminPhone');
        const adminCountry = document.getElementById('adminCountry');
        const adminCity = document.getElementById('adminCity');
        const adminBirthDate = document.getElementById('adminBirthDate');
        if (adminName) adminName.value = admin.nombre || '';
        if (adminEmail) adminEmail.value = admin.email || '';
        if (adminPhone) adminPhone.value = admin.telefono || '';
        if (adminCountry) adminCountry.value = admin.pais || 'Colombia';
        if (adminCity) adminCity.value = admin.ciudad || '';
        if (adminBirthDate) adminBirthDate.value = admin.fecha_nacimiento || '';

        if (elements.systemStatusCards) {
            elements.systemStatusCards.innerHTML = `
                <div class="func-row"><div><strong>Usuarios</strong><div class="muted">${system.users || 0} perfiles cargados</div></div><div class="toggle-wrap"><span class="status-chip online">OK</span></div></div>
                <div class="func-row"><div><strong>Destinos</strong><div class="muted">${system.destinations || 0} destinos sincronizados</div></div><div class="toggle-wrap"><span class="status-chip online">OK</span></div></div>
                <div class="func-row"><div><strong>Reservaciones</strong><div class="muted">${system.reservations || 0} operaciones registradas</div></div><div class="toggle-wrap"><span class="status-chip online">OK</span></div></div>
                <div class="func-row"><div><strong>Última sincronización</strong><div class="muted">${escapeHtml(formatDate(system.lastSync))}</div></div><div class="toggle-wrap"><span class="status-chip online">LIVE</span></div></div>
            `;
        }
    }

    function renderAll() {
        renderDashboard();
        renderInventory();
        renderUsers();
        renderOperations();
        renderFinance();
        renderExperience();
        renderConfig();
    }

    async function loadPanel(showMessage = false) {
        const data = await apiRequest(`/admin/panel?adminId=${encodeURIComponent(adminId)}`);
        state.panel = data;
        renderAll();
        if (showMessage) {
            showToast('Panel actualizado.', 'success');
        }
    }

    function getDestinationById(destinationId) {
        return state.panel?.inventory?.destinations?.find((item) => item.id === destinationId) || null;
    }

    function getUserById(userId) {
        return state.panel?.users?.records?.find((item) => item.id === userId) || null;
    }

    function openDestinationModal(destination = null) {
        const title = destination ? 'Editar destino' : 'Nuevo destino';
        openModal(`
            <h3>${title}</h3>
            <form id="destinationForm">
                <div class="form-row">
                    <div style="flex:1"><label>Nombre</label><input name="nombre" type="text" value="${escapeHtml(destination?.name || '')}" required></div>
                    <div style="flex:1"><label>Precio</label><input name="precio" type="number" min="0" value="${escapeHtml(destination?.price || 0)}"></div>
                </div>
                <div class="form-row">
                    <div style="flex:1"><label>País</label><input name="pais" type="text" value="${escapeHtml(destination?.country || 'Colombia')}"></div>
                    <div style="flex:1"><label>Ciudad</label><input name="ciudad" type="text" value="${escapeHtml(destination?.city || '')}" required></div>
                </div>
                <div class="form-row">
                    <div style="flex:1"><label>Clima</label><input name="clima" type="text" value="${escapeHtml(destination?.climate || '')}"></div>
                    <div style="flex:1"><label>Imagen URL</label><input name="imageUrl" type="text" value="${escapeHtml(destination?.image || '')}"></div>
                </div>
                <label>Descripción</label>
                <textarea name="descripcion">${escapeHtml(destination?.description || '')}</textarea>
                ${destination ? `<label style="margin-top:10px"><input name="activo" type="checkbox" ${destination.activo ? 'checked' : ''}> Activo</label>` : ''}
                <div class="actions">
                    <button type="button" class="btn btn-cancel" data-close-modal>Cancelar</button>
                    <button type="submit" class="btn btn-save">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('destinationForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const payload = {
                adminId,
                nombre: formData.get('nombre'),
                pais: formData.get('pais'),
                ciudad: formData.get('ciudad'),
                clima: formData.get('clima'),
                descripcion: formData.get('descripcion'),
                precio: Number(formData.get('precio') || 0),
                imageUrl: formData.get('imageUrl')
            };
            if (destination) payload.activo = formData.get('activo') === 'on';

            try {
                await apiRequest(destination ? `/admin/destinos/${destination.id}` : '/admin/destinos', {
                    method: destination ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                closeModal();
                await loadPanel();
                showToast(destination ? 'Destino actualizado.' : 'Destino creado.', 'success');
            } catch (error) {
                showToast(error.message, 'warn');
            }
        });
    }

    function openUserModal(user = null) {
        const title = user ? 'Editar usuario' : 'Nuevo usuario';
        openModal(`
            <h3>${title}</h3>
            <form id="userForm">
                <div class="form-row">
                    <div style="flex:1"><label>Nombre</label><input name="nombre" type="text" value="${escapeHtml(user?.name || '')}" required></div>
                    <div style="flex:1"><label>Email</label><input name="email" type="text" value="${escapeHtml(user?.email || '')}" ${user ? 'readonly' : 'required'}></div>
                </div>
                <div class="form-row">
                    <div style="flex:1"><label>Rol</label><select name="rol"><option value="cliente" ${user?.role === 'cliente' ? 'selected' : ''}>cliente</option><option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>admin</option></select></div>
                    <div style="flex:1"><label>Teléfono</label><input name="telefono" type="text" value="${escapeHtml(user?.phone || '')}"></div>
                </div>
                <div class="form-row">
                    <div style="flex:1"><label>País</label><input name="pais" type="text" value="${escapeHtml(user?.country || 'Colombia')}"></div>
                    <div style="flex:1"><label>Ciudad</label><input name="ciudad" type="text" value="${escapeHtml(user?.city || '')}"></div>
                </div>
                <div class="form-row">
                    <div style="flex:1"><label>Fecha de nacimiento</label><input name="fecha_nacimiento" type="date" value="${escapeHtml(user?.birthDate || '')}"></div>
                    ${user ? '<div style="flex:1"></div>' : '<div style="flex:1"><label>Contraseña</label><input name="password" type="text" value="12345678"></div>'}
                </div>
                <div class="actions">
                    <button type="button" class="btn btn-cancel" data-close-modal>Cancelar</button>
                    <button type="submit" class="btn btn-save">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('userForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const payload = {
                adminId,
                nombre: formData.get('nombre'),
                email: formData.get('email'),
                rol: formData.get('rol'),
                telefono: formData.get('telefono'),
                pais: formData.get('pais'),
                ciudad: formData.get('ciudad'),
                fecha_nacimiento: formData.get('fecha_nacimiento') || null
            };
            if (!user) payload.password = formData.get('password');

            try {
                await apiRequest(user ? `/admin/usuarios/${user.id}` : '/admin/usuarios', {
                    method: user ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                closeModal();
                await loadPanel();
                showToast(user ? 'Usuario actualizado.' : 'Usuario creado.', 'success');
            } catch (error) {
                showToast(error.message, 'warn');
            }
        });
    }

    function openCalendarModal() {
        const reservations = state.panel?.operations?.reservations || [];
        const grouped = reservations.reduce((acc, item) => {
            const key = String(item.date || '').slice(0, 10) || 'sin-fecha';
            acc[key] = acc[key] || [];
            acc[key].push(item);
            return acc;
        }, {});
        const keys = Object.keys(grouped).sort();

        openModal(`
            <div class="modal-headline">
                <h3>Calendario Operativo</h3>
                <p>Reservas agrupadas por fecha para revisar la carga de trabajo.</p>
            </div>
            <div class="calendar-grid admin-calendar-grid">
                ${keys.length ? keys.map((key) => `
                    <div class="calendar-cell">
                        <span class="date-badge">${escapeHtml(formatDate(key))}</span>
                        ${grouped[key].map((item) => `<div><span class="booking-dot"></span>${escapeHtml(item.destination)}</div>`).join('')}
                    </div>
                `).join('') : '<div class="calendar-cell">Sin reservas programadas.</div>'}
            </div>
            <div class="actions"><button type="button" class="btn btn-cancel" data-close-modal>Cerrar</button></div>
        `);
    }

    function openReportModal() {
        const finance = state.panel?.finance?.metrics || {};
        openModal(`
            <div class="modal-headline">
                <h3>Reporte Financiero</h3>
                <p>Resumen rápido del rendimiento económico actual.</p>
            </div>
            <div class="report-summary-grid">
                <article class="report-summary-card">
                    <span class="report-label">Ingresos</span>
                    <strong>${formatCurrency(finance.income)}</strong>
                </article>
                <article class="report-summary-card">
                    <span class="report-label">Gastos</span>
                    <strong>${formatCurrency(finance.expenses)}</strong>
                </article>
                <article class="report-summary-card">
                    <span class="report-label">Beneficio</span>
                    <strong>${formatCurrency(finance.benefit)}</strong>
                </article>
                <article class="report-summary-card">
                    <span class="report-label">Reportes generados</span>
                    <strong>${finance.reports || 0}</strong>
                </article>
            </div>
            <div class="actions"><button type="button" class="btn btn-cancel" data-close-modal>Cerrar</button></div>
        `);
    }

    async function updateReservationStatus(reservationId, status) {
        await apiRequest(`/admin/reservas/${reservationId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminId, status })
        });
        await loadPanel();
        showToast('Reserva actualizada.', 'success');
    }

    async function saveAdminSettings() {
        const payload = {
            adminId,
            nombre: document.getElementById('adminName')?.value || '',
            rol: 'admin',
            telefono: document.getElementById('adminPhone')?.value || '',
            pais: document.getElementById('adminCountry')?.value || 'Colombia',
            ciudad: document.getElementById('adminCity')?.value || '',
            fecha_nacimiento: document.getElementById('adminBirthDate')?.value || null
        };

        await apiRequest(`/admin/usuarios/${adminId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const currentUser = safeJsonParse(localStorage.getItem('loggedUser') || 'null', {}) || {};
        currentUser.username = payload.nombre;
        currentUser.rol = 'admin';
        localStorage.setItem('loggedUser', JSON.stringify(currentUser));
        await loadPanel();
        showToast('Configuración actualizada.', 'success');
    }

    function bindViewNavigation() {
        elements.navLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href')?.replace('#', '');
                if (targetId) showView(targetId);
            });
        });
    }

    function bindActions() {
        elements.adminRefreshBtn?.addEventListener('click', () => {
            loadPanel(true).catch((error) => showToast(error.message, 'warn'));
        });

        elements.newDestinationBtn?.addEventListener('click', () => openDestinationModal());
        elements.newUserBtn?.addEventListener('click', () => openUserModal());
        elements.viewCalendarBtn?.addEventListener('click', openCalendarModal);
        elements.genReportBtn?.addEventListener('click', openReportModal);
        elements.filterDest?.addEventListener('change', (event) => {
            state.currentExperienceFilter = event.target.value;
            renderExperienceItems();
        });

        elements.inventorySearchInput?.addEventListener('input', (event) => {
            state.filters.inventoryQuery = event.target.value;
            renderInventory();
        });
        elements.inventoryStatusFilter?.addEventListener('change', (event) => {
            state.filters.inventoryStatus = event.target.value;
            renderInventory();
        });

        elements.usersSearchInput?.addEventListener('input', (event) => {
            state.filters.usersQuery = event.target.value;
            renderUsers();
        });
        elements.usersRoleFilter?.addEventListener('change', (event) => {
            state.filters.usersRole = event.target.value;
            renderUsers();
        });

        elements.operationsSearchInput?.addEventListener('input', (event) => {
            state.filters.operationsQuery = event.target.value;
            renderOperations();
        });
        elements.operationsStatusFilter?.addEventListener('change', (event) => {
            state.filters.operationsStatus = event.target.value;
            renderOperations();
        });

        elements.saveSettingsBtn?.addEventListener('click', () => {
            saveAdminSettings().catch((error) => showToast(error.message, 'warn'));
        });

        elements.logoutAdminBtn?.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('loggedUser');
            window.location.href = '../index.html';
        });

        elements.inventoryTableBody?.addEventListener('click', async (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            const destinationId = button.dataset.id;
            const destination = getDestinationById(destinationId);
            if (button.dataset.action === 'edit-destination' && destination) {
                openDestinationModal(destination);
                return;
            }
            if (button.dataset.action === 'delete-destination' && destination && window.confirm(`Desactivar ${destination.name}?`)) {
                try {
                    await apiRequest(`/admin/destinos/${destination.id}?adminId=${encodeURIComponent(adminId)}`, { method: 'DELETE' });
                    await loadPanel();
                    showToast('Destino desactivado.', 'success');
                } catch (error) {
                    showToast(error.message, 'warn');
                }
            }
        });

        elements.usersTableBody?.addEventListener('click', async (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            const user = getUserById(button.dataset.id);
            if (!user) return;
            if (button.dataset.action === 'edit-user') {
                openUserModal(user);
                return;
            }
            if (button.dataset.action === 'delete-user' && window.confirm(`Eliminar ${user.name}?`)) {
                try {
                    await apiRequest(`/admin/usuarios/${user.id}?adminId=${encodeURIComponent(adminId)}`, { method: 'DELETE' });
                    await loadPanel();
                    showToast('Usuario eliminado.', 'success');
                } catch (error) {
                    showToast(error.message, 'warn');
                }
            }
        });

        elements.operationsTableBody?.addEventListener('click', async (event) => {
            const button = event.target.closest('[data-action="status-reservation"]');
            if (!button) return;
            try {
                await updateReservationStatus(button.dataset.id, button.dataset.status);
            } catch (error) {
                showToast(error.message, 'warn');
            }
        });
    }

    bindModalDismiss();
    bindViewNavigation();
    bindActions();
    showView('dashboard');

    loadPanel().catch((error) => {
        showToast(error.message, 'warn');
        if (elements.alertsList) {
            elements.alertsList.innerHTML = renderEmptyPanel('No se pudo cargar el panel', error.message);
        }
    });
});