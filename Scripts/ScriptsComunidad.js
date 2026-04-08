document.addEventListener('DOMContentLoaded', async () => {
    const chatItemsContainer = document.getElementById('chatItems');
    const messagesContainer = document.getElementById('messagesContainer');
    const chatTitle = document.getElementById('chatTitle');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const emojiBtn = document.getElementById('emojiBtn');
    const micBtn = document.getElementById('micBtn');
    const callBtn = document.getElementById('callBtn');
    const photoBtn = document.getElementById('photoBtn');
    const photoInput = document.getElementById('photoInput');
    const searchBtn = document.getElementById('searchBtn');
    const menuBtn = document.getElementById('menuBtn');
    const sidebarOptionsBtn = document.getElementById('sidebarOptionsBtn');
    const chatSearch = document.getElementById('chatSearch');

    const newChatBtn = document.getElementById('newChatBtn');
    const newGroupBtn = document.getElementById('newGroupBtn');
    const addUserModal = document.getElementById('addUserModal');
    const addUserSearch = document.getElementById('addUserSearch');
    const addUserList = document.getElementById('addUserList');
    const closeAddUserModal = document.getElementById('closeAddUserModal');

    const createGroupModal = document.getElementById('createGroupModal');
    const groupNameInput = document.getElementById('groupNameInput');
    const groupMemberSearch = document.getElementById('groupMemberSearch');
    const groupUsersList = document.getElementById('groupUsersList');
    const cancelCreateGroup = document.getElementById('cancelCreateGroup');
    const confirmCreateGroup = document.getElementById('confirmCreateGroup');

    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }

    const loggedUserId = loggedUser.userId || loggedUser.id;
    const loggedName = loggedUser.username || 'Usuario';
    const currentInitials = loggedName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const uiEl = document.getElementById('userInitials');
    if (uiEl) uiEl.textContent = currentInitials;
    document.getElementById('currentUserAvatar').textContent = currentInitials;

    let activeChatId = null;
    let chats = [];
    let allUsers = [];
    let selectedGroupMembers = new Set();
    let currentMessageSearchTerm = '';

    function initialsFromName(name) {
        return String(name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function normalizeId(value) {
        return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    function createTone() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 440;
        osc.connect(ctx.destination);
        return { ctx, osc };
    }

    function getStorageKey() {
        return `comunidadChats_${loggedUserId || loggedUser.email}`;
    }

    function loadChats() {
        const stored = localStorage.getItem(getStorageKey());
        if (stored) {
            chats = JSON.parse(stored);
            return;
        }
        chats = [
            {
                id: `guide-${normalizeId(loggedUserId || loggedUser.email)}`,
                type: 'direct',
                memberIds: [],
                name: 'Guia Tropical',
                avatar: 'GT',
                messages: [{ from: 'other', text: 'Tu guia te esperara en el hotel.', time: 'hoy' }],
                autoReplied: false
            }
        ];
        saveChats();
    }

    function saveChats() {
        localStorage.setItem(getStorageKey(), JSON.stringify(chats));
    }

    async function fetchUsers(search = '') {
        try {
            const params = new URLSearchParams({ excludeUserId: loggedUserId || '' });
            if (search.trim()) params.set('search', search.trim());
            const response = await fetch(`/usuarios?${params.toString()}`);
            if (!response.ok) throw new Error('No se pudieron obtener usuarios');
            const data = await response.json();
            allUsers = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error consultando usuarios:', error);
            allUsers = [];
        }
    }

    function renderChatList(filter = '') {
        chatItemsContainer.innerHTML = '';
        const normalizedFilter = filter.trim().toLowerCase();
        const visibleChats = normalizedFilter
            ? chats.filter((chat) => chat.name.toLowerCase().includes(normalizedFilter))
            : chats;

        visibleChats.forEach((chat) => {
            const item = document.createElement('div');
            item.className = 'chat-item';
            if (chat.id === activeChatId) item.classList.add('active');
            item.dataset.id = chat.id;

            const lastMessage = chat.messages.length ? chat.messages[chat.messages.length - 1].text : '';
            item.innerHTML = `
                <div class="avatar">${chat.avatar}</div>
                <div class="info">
                    <div class="name">${chat.name}</div>
                    <div class="snippet">${lastMessage}</div>
                </div>
            `;

            item.addEventListener('click', () => switchChat(chat.id));
            chatItemsContainer.appendChild(item);
        });
    }

    function switchChat(id) {
        activeChatId = id;
        renderChatList(chatSearch.value);
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;
        chatTitle.textContent = chat.name;
        renderMessages(chat);
    }

    function renderMessages(chat) {
        messagesContainer.innerHTML = '';
        chat.messages.forEach((m) => {
            const msg = document.createElement('div');
            msg.className = 'message ' + (m.from === 'me' ? 'sent' : 'received');
            const text = String(m.text || '');

            if (currentMessageSearchTerm && text.toLowerCase().includes(currentMessageSearchTerm.toLowerCase())) {
                msg.classList.add('message-highlight');
            }

            if (m.type === 'image' && m.imageData) {
                const image = document.createElement('img');
                image.src = m.imageData;
                image.alt = text || 'Imagen enviada';
                image.className = 'message-image';
                msg.appendChild(image);
                if (text) {
                    const caption = document.createElement('div');
                    caption.className = 'message-caption';
                    caption.textContent = text;
                    msg.appendChild(caption);
                }
            } else {
                msg.textContent = text;
            }

            messagesContainer.appendChild(msg);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function insertAtCursor(input, value) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        input.value = input.value.slice(0, start) + value + input.value.slice(end);
        const nextPos = start + value.length;
        input.setSelectionRange(nextPos, nextPos);
        input.focus();
    }

    function sendPhotoFile(file) {
        if (!file || !activeChatId) return;
        const reader = new FileReader();
        reader.onload = () => {
            const chat = chats.find((c) => c.id === activeChatId);
            if (!chat) return;
            chat.messages.push({
                from: 'me',
                type: 'image',
                imageData: String(reader.result || ''),
                text: file.name,
                time: new Date().toLocaleTimeString().slice(0, 5)
            });
            saveChats();
            renderMessages(chat);
            renderChatList(chatSearch.value);
        };
        reader.readAsDataURL(file);
    }

    function sendMessage(text) {
        if (!activeChatId || !text.trim()) return;
        const chat = chats.find((c) => c.id === activeChatId);
        if (!chat) return;

        const now = new Date();
        chat.messages.push({ from: 'me', text: text.trim(), time: now.toLocaleTimeString().slice(0, 5) });
        saveChats();
        renderMessages(chat);
        renderChatList(chatSearch.value);

        if (!chat.autoReplied) {
            chat.autoReplied = true;
            setTimeout(() => {
                chat.messages.push({
                    from: 'other',
                    text: 'Gracias por tu mensaje. Te respondemos pronto.',
                    time: new Date().toLocaleTimeString().slice(0, 5)
                });
                saveChats();
                if (activeChatId === chat.id) renderMessages(chat);
                renderChatList(chatSearch.value);
            }, 1800);
        }
    }

    function openModal(modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    function upsertDirectChat(user) {
        const directChatId = `direct-${normalizeId(user.id)}`;
        let chat = chats.find((c) => c.id === directChatId);

        if (!chat) {
            chat = {
                id: directChatId,
                type: 'direct',
                memberIds: [user.id],
                name: user.nombre,
                avatar: initialsFromName(user.nombre),
                messages: [{ from: 'other', text: `Hola ${loggedName}, soy ${user.nombre}.`, time: 'ahora' }],
                autoReplied: false
            };
            chats.unshift(chat);
            saveChats();
        }

        switchChat(chat.id);
        closeModal(addUserModal);
    }

    function renderAddUserList(users) {
        addUserList.innerHTML = '';

        if (!users.length) {
            addUserList.innerHTML = '<p class="community-user-mail">No hay usuarios para mostrar.</p>';
            return;
        }

        users.forEach((user) => {
            const item = document.createElement('div');
            item.className = 'community-user-item';
            item.innerHTML = `
                <div class="community-user-main">
                    <div class="community-user-avatar">${initialsFromName(user.nombre)}</div>
                    <div>
                        <p class="community-user-name">${user.nombre}</p>
                        <p class="community-user-mail">${user.email}</p>
                    </div>
                </div>
                <button class="community-user-add" data-id="${user.id}" title="Agregar">+</button>
            `;

            item.querySelector('.community-user-add').addEventListener('click', () => upsertDirectChat(user));
            addUserList.appendChild(item);
        });
    }

    function renderGroupUsersList(users) {
        groupUsersList.innerHTML = '';

        if (!users.length) {
            groupUsersList.innerHTML = '<p class="community-user-mail">No hay usuarios para mostrar.</p>';
            return;
        }

        users.forEach((user) => {
            const selected = selectedGroupMembers.has(user.id);
            const item = document.createElement('div');
            item.className = 'community-user-item';
            item.innerHTML = `
                <div class="community-user-main">
                    <div class="community-user-avatar">${initialsFromName(user.nombre)}</div>
                    <div>
                        <p class="community-user-name">${user.nombre}</p>
                        <p class="community-user-mail">${user.email}</p>
                    </div>
                </div>
                <button class="community-user-check ${selected ? 'active' : ''}" data-id="${user.id}" title="Seleccionar">${selected ? '✓' : '+'}</button>
            `;

            item.querySelector('.community-user-check').addEventListener('click', () => {
                if (selectedGroupMembers.has(user.id)) {
                    selectedGroupMembers.delete(user.id);
                } else {
                    selectedGroupMembers.add(user.id);
                }
                renderGroupUsersList(users);
            });

            groupUsersList.appendChild(item);
        });
    }

    function createGroupChat() {
        const groupName = groupNameInput.value.trim();
        if (!groupName) {
            alert('Escribe un nombre para el grupo.');
            return;
        }

        const memberIds = Array.from(selectedGroupMembers);
        if (!memberIds.length) {
            alert('Selecciona al menos un miembro.');
            return;
        }

        const groupId = `group-${Date.now()}`;
        const chat = {
            id: groupId,
            type: 'group',
            memberIds,
            name: groupName,
            avatar: initialsFromName(groupName),
            messages: [{ from: 'other', text: `Grupo ${groupName} creado correctamente.`, time: 'ahora' }],
            autoReplied: false
        };

        chats.unshift(chat);
        saveChats();
        switchChat(chat.id);
        closeModal(createGroupModal);
        groupNameInput.value = '';
        groupMemberSearch.value = '';
        selectedGroupMembers = new Set();
    }

    sendBtn.addEventListener('click', () => {
        sendMessage(messageInput.value);
        messageInput.value = '';
    });

    photoBtn.addEventListener('click', () => {
        if (!activeChatId) {
            alert('Selecciona un chat antes de enviar una foto.');
            return;
        }
        photoInput.value = '';
        photoInput.click();
    });

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        sendPhotoFile(file);
    });

    searchBtn.addEventListener('click', () => {
        if (!activeChatId) {
            alert('Selecciona un chat para buscar mensajes.');
            return;
        }
        const term = prompt('Buscar en este chat:');
        if (term === null) return;
        currentMessageSearchTerm = term.trim();

        const chat = chats.find((c) => c.id === activeChatId);
        if (!chat) return;
        renderMessages(chat);

        if (!currentMessageSearchTerm) return;
        const hasResults = chat.messages.some((m) => String(m.text || '').toLowerCase().includes(currentMessageSearchTerm.toLowerCase()));
        if (!hasResults) {
            alert('No se encontraron coincidencias en este chat.');
        }
    });

    const emojiPanel = document.createElement('div');
    emojiPanel.className = 'emoji-panel';
    emojiPanel.innerHTML = ['😀', '😂', '😍', '😎', '👍', '🙏', '🎉', '🌴', '✈️', '🔥']
        .map((emoji) => `<button type="button" class="emoji-item">${emoji}</button>`)
        .join('');
    document.body.appendChild(emojiPanel);

    emojiBtn.addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        emojiPanel.classList.toggle('active');
        emojiPanel.style.left = `${Math.max(16, rect.left - 20)}px`;
        emojiPanel.style.top = `${rect.top - 180}px`;
    });

    emojiPanel.querySelectorAll('.emoji-item').forEach((btn) => {
        btn.addEventListener('click', () => {
            insertAtCursor(messageInput, btn.textContent || '');
        });
    });

    micBtn.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Tu navegador no soporta reconocimiento de voz.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-CO';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript || '';
            insertAtCursor(messageInput, transcript + ' ');
        };
        recognition.onerror = () => {
            alert('No fue posible capturar el audio. Intenta de nuevo.');
        };
        recognition.start();
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
            e.preventDefault();
        }
    });

    chatSearch.addEventListener('input', () => renderChatList(chatSearch.value));

    newChatBtn.addEventListener('click', async () => {
        await fetchUsers(addUserSearch.value);
        renderAddUserList(allUsers);
        openModal(addUserModal);
    });

    addUserSearch.addEventListener('input', async () => {
        await fetchUsers(addUserSearch.value);
        renderAddUserList(allUsers);
    });

    closeAddUserModal.addEventListener('click', () => closeModal(addUserModal));

    newGroupBtn.addEventListener('click', async () => {
        selectedGroupMembers = new Set();
        groupNameInput.value = '';
        groupMemberSearch.value = '';
        await fetchUsers('');
        renderGroupUsersList(allUsers);
        openModal(createGroupModal);
    });

    groupMemberSearch.addEventListener('input', async () => {
        await fetchUsers(groupMemberSearch.value);
        renderGroupUsersList(allUsers);
    });

    cancelCreateGroup.addEventListener('click', () => closeModal(createGroupModal));
    confirmCreateGroup.addEventListener('click', createGroupChat);

    [addUserModal, createGroupModal].forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    callBtn.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'call-overlay';
        overlay.textContent = 'Llamando...';
        document.body.appendChild(overlay);
        overlay.classList.add('active');

        const tone = createTone();
        tone.osc.start();

        const endCall = () => {
            try {
                tone.osc.stop();
                tone.ctx.close();
            } catch (_) {
                // avoid breaking on double close
            }
            overlay.classList.remove('active');
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        };

        const escHandler = (e) => {
            if (e.key === 'Escape') endCall();
        };

        document.addEventListener('keydown', escHandler);
        setTimeout(endCall, 30000);
    });

    const menu = document.createElement('div');
    menu.className = 'chat-menu';
    menu.innerHTML = `
        <button id="menuInfo">Informacion</button>
        <button id="menuLeave">Salir del chat</button>
    `;
    document.body.appendChild(menu);

    const sidebarMenu = document.createElement('div');
    sidebarMenu.className = 'chat-menu';
    sidebarMenu.innerHTML = `
        <button id="sidebarCreateChat">Nuevo chat</button>
        <button id="sidebarCreateGroup">Crear grupo</button>
        <button id="sidebarDeleteActive">Eliminar chat activo</button>
    `;
    document.body.appendChild(sidebarMenu);

    const menuInfo = menu.querySelector('#menuInfo');
    const menuLeave = menu.querySelector('#menuLeave');
    const sidebarCreateChat = sidebarMenu.querySelector('#sidebarCreateChat');
    const sidebarCreateGroup = sidebarMenu.querySelector('#sidebarCreateGroup');
    const sidebarDeleteActive = sidebarMenu.querySelector('#sidebarDeleteActive');

    menuBtn.addEventListener('click', (e) => {
        menu.classList.toggle('active');
        menu.style.top = (e.clientY + 5) + 'px';
        menu.style.left = (e.clientX - 120) + 'px';
        sidebarMenu.classList.remove('active');
    });

    sidebarOptionsBtn.addEventListener('click', (e) => {
        sidebarMenu.classList.toggle('active');
        sidebarMenu.style.top = (e.clientY + 5) + 'px';
        sidebarMenu.style.left = (e.clientX - 120) + 'px';
        menu.classList.remove('active');
    });

    menuInfo.addEventListener('click', () => {
        if (!activeChatId) {
            alert('Selecciona un chat para ver informacion.');
            return;
        }
        const chat = chats.find((c) => c.id === activeChatId);
        if (!chat) return;
        if (chat.type === 'group') {
            alert(`Grupo: ${chat.name}\nMiembros: ${chat.memberIds.length}`);
        } else {
            alert(`Chat directo con ${chat.name}`);
        }
        menu.classList.remove('active');
    });

    menuLeave.addEventListener('click', () => {
        if (!activeChatId) {
            alert('No hay un chat activo.');
            return;
        }
        const chat = chats.find((c) => c.id === activeChatId);
        if (!chat) return;
        const confirmed = confirm(`Deseas salir de "${chat.name}"?`);
        if (!confirmed) return;

        chats = chats.filter((c) => c.id !== activeChatId);
        activeChatId = chats.length ? chats[0].id : null;
        saveChats();
        renderChatList(chatSearch.value);

        if (activeChatId) {
            switchChat(activeChatId);
        } else {
            chatTitle.textContent = 'Selecciona un chat';
            messagesContainer.innerHTML = '';
        }
        menu.classList.remove('active');
    });

    sidebarCreateChat.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        newChatBtn.click();
    });

    sidebarCreateGroup.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        newGroupBtn.click();
    });

    sidebarDeleteActive.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        menuLeave.click();
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== menuBtn) {
            menu.classList.remove('active');
        }
        if (!sidebarMenu.contains(e.target) && e.target !== sidebarOptionsBtn) {
            sidebarMenu.classList.remove('active');
        }
        if (!emojiPanel.contains(e.target) && e.target !== emojiBtn) {
            emojiPanel.classList.remove('active');
        }
    });

    loadChats();
    renderChatList();
    if (chats.length) {
        switchChat(chats[0].id);
    }
});