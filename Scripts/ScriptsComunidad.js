// Chat comunidad script

document.addEventListener('DOMContentLoaded', () => {
    const chatListContainer = document.querySelector('.chat-list');
    const messagesContainer = document.getElementById('messagesContainer');
    const chatTitle = document.getElementById('chatTitle');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const callBtn = document.getElementById('callBtn');
    const menuBtn = document.getElementById('menuBtn');

    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }
    let activeChatId = null;
    let chats = [];

    // audio tone for call
    let callTone;
    function createTone() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 440; // A4
        osc.connect(ctx.destination);
        return { ctx, osc };
    }

    // load or initialize chats
    function loadChats() {
        const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
        if (!user) {
            chats = [];
            return;
        }
        const key = `comunidadChats_${user.id || user.email}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            chats = JSON.parse(stored);
        } else {
            chats = [
                { id: `group-${user.id || user.email}-1`, name: `${user.username || 'Tu'} Grupo`, avatar: 'G', messages: [{ from: 'other', text: `¡Bienvenido ${user.username || 'viajero'}!`, time: 'ahora' }], autoReplied: false },
                { id: `guide-${user.id || user.email}`, name: 'Guía Tropical', avatar: 'T', messages: [{ from: 'other', text: 'Tu guía te esperará en el hotel.', time: 'hoy' }], autoReplied: false }
            ];
            saveChats();
        }
    }

    function saveChats() {
        const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
        if (!user) return;
        const key = `comunidadChats_${user.id || user.email}`;
        localStorage.setItem(key, JSON.stringify(chats));
    }

    function renderChatList() {
        chatListContainer.innerHTML = '';
        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-item';
            if (chat.id === activeChatId) item.classList.add('active');
            item.dataset.id = chat.id;
            item.innerHTML = `
                <div class="avatar">${chat.avatar}</div>
                <div class="info">
                    <div class="name">${chat.name}</div>
                    <div class="snippet">${chat.messages.slice(-1)[0]?.text || ''}</div>
                </div>
            `;
            item.addEventListener('click', () => switchChat(chat.id));
            chatListContainer.appendChild(item);
        });
    }

    function switchChat(id) {
        activeChatId = id;
        renderChatList();
        const chat = chats.find(c => c.id === id);
        chatTitle.textContent = chat.name;
        renderMessages(chat);
    }

    function renderMessages(chat) {
        messagesContainer.innerHTML = '';
        chat.messages.forEach(m => {
            const msg = document.createElement('div');
            msg.className = 'message ' + (m.from === 'me' ? 'sent' : 'received');
            msg.textContent = m.text;
            messagesContainer.appendChild(msg);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function sendMessage(text) {
        if (!activeChatId || !text.trim()) return;
        const chat = chats.find(c => c.id === activeChatId);
        const now = new Date();
        chat.messages.push({ from: 'me', text, time: now.toLocaleTimeString().slice(0,5) });
        saveChats();
        renderMessages(chat);
        renderChatList();

        // auto-reply once if not done
        if (!chat.autoReplied) {
            chat.autoReplied = true;
            setTimeout(() => {
                const reply = 'Disculpe, le contesto más tarde.';
                chat.messages.push({ from: 'other', text: reply, time: new Date().toLocaleTimeString().slice(0,5) });
                saveChats();
                if (activeChatId === chat.id) renderMessages(chat);
                renderChatList();
            }, 2000);
        }
    }

    sendBtn.addEventListener('click', () => {
        sendMessage(messageInput.value);
        messageInput.value = '';
    });

    // search filter
    const chatSearch = document.getElementById('chatSearch');
    chatSearch.addEventListener('input', () => {
        const term = chatSearch.value.toLowerCase();
        document.querySelectorAll('.chat-item').forEach(item => {
            const name = item.querySelector('.name').textContent.toLowerCase();
            item.style.display = name.includes(term) ? 'flex' : 'none';
        });
    });

    messageInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            sendBtn.click();
            e.preventDefault();
        }
    });

    // call button behavior
    callBtn.addEventListener('click', () => startCall());

    function startCall() {
        const overlay = document.createElement('div');
        overlay.className = 'call-overlay';
        overlay.textContent = 'Llamando...';
        document.body.appendChild(overlay);
        overlay.classList.add('active');

        const tone = createTone();
        tone.osc.start();

        const endCall = () => {
            tone.osc.stop();
            tone.ctx.close();
            overlay.classList.remove('active');
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', escHandler);
        };

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                endCall();
            }
        };

        document.addEventListener('keydown', escHandler);

        setTimeout(endCall, 30000);
    }

    // simple menu
    const menu = document.createElement('div');
    menu.className = 'chat-menu';
    menu.innerHTML = `
        <button id="menuInfo">Información</button>
        <button id="menuLeave">Salir</button>
    `;
    document.body.appendChild(menu);

    menuBtn.addEventListener('click', e => {
        menu.classList.toggle('active');
        menu.style.top = (e.clientY + 5) + 'px';
        menu.style.left = (e.clientX - 100) + 'px';
    });
    document.addEventListener('click', e => {
        if (!menu.contains(e.target) && e.target !== menuBtn) {
            menu.classList.remove('active');
        }
    });

    // initialization
    loadChats();
    renderChatList();
    if (chats.length) switchChat(chats[0].id);
});