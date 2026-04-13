document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // VALIDAR USUARIO
    // =========================
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');

    if (!loggedUser) {
        window.location.href = '../index.html';
        return;
    }

    function getAuthHeaders() {
        const token = localStorage.getItem('authToken') || '';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // =========================
    // ELEMENTOS
    // =========================
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const userInitials = document.getElementById('userInitials');

    // VALIDACIÓN IMPORTANTE (para evitar que falle silenciosamente)
    if (!chatInput || !sendBtn || !chatMessages) {
        console.error("Elementos del chat no encontrados en el HTML");
        return;
    }

    // Iniciales usuario
    const initials = (loggedUser.username || 'US')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (userInitials) userInitials.textContent = initials;

    // =========================
    // MENSAJE INICIAL
    // =========================
    addMessage('ai', '¡Hola! Soy tu asistente de viajes LawMoon🌴 ¿En qué puedo ayudarte?');

    // =========================
    // EVENTOS
    // =========================
    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // =========================
    // FUNCIONES
    // =========================

    function addMessage(type, text) {
        const message = document.createElement('div');
        message.className = `message ${type === 'user' ? 'user-message' : 'ai-message'}`;

        message.innerHTML = `
            <div class="message-avatar">
                ${type === 'user' ? initials : '🤖'}
            </div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;

        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        removeTyping(); // evita duplicados

        const typing = document.createElement('div');
        typing.className = 'message ai-message';
        typing.id = 'typing';

        typing.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>Escribiendo...</p>
            </div>
        `;

        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        const typing = document.getElementById('typing');
        if (typing) typing.remove();
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        console.log("Enviando:", text); 

        addMessage('user', text);
        chatInput.value = '';
        showTyping();

        try {
            const response = await fetch('http://localhost:5501/chat', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ message: text })
            });

            console.log("Status:", response.status); 

            const data = await response.json();

            console.log("Respuesta backend:", data); 

            removeTyping();

            if (!response.ok) {
                addMessage('ai', 'Error del servidor.');
                return;
            }

            addMessage('ai', data.reply || 'No tengo respuesta en este momento.');

        } catch (error) {
            removeTyping();
            console.error("Error fetch:", error);
            addMessage('ai', 'No se pudo conectar con el servidor.');
        }
    }

});