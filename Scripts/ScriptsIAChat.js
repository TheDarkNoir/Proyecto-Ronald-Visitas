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

    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const msgUserInitials = document.getElementById('msgUserInitials');
    const userInitials = document.getElementById('userInitials');
    const newChatBtn = document.querySelector('.btn-new-chat');
    const chatHistory = document.querySelector('.chat-history');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');

    if (!chatInput || !sendBtn || !chatMessages || !chatHistory || !newChatBtn) {
        console.error('Elementos del IA chat no encontrados.');
        return;
    }

    const initials = (loggedUser.username || loggedUser.email || 'US')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (userInitials) userInitials.textContent = initials;
    if (msgUserInitials) msgUserInitials.textContent = initials;

    const historyKey = `iaChatHistory_${loggedUser.userId || loggedUser.id || loggedUser.email}`;
    const chatsKey = `iaChats_${loggedUser.userId || loggedUser.id || loggedUser.email}`;

    let chatThreads = [];
    let activeThreadId = null;
    let isSending = false;

    function getDefaultWelcomeMessage() {
        return '¡Hola! Soy tu asistente de viajes de Tropical Travel. ¿A dónde te gustaría viajar?';
    }

    function getNewChatMessage() {
        return '¡Nuevo chat iniciado! ¿En qué puedo ayudarte hoy?';
    }

    function uid(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function normalizeThreadMessage(message) {
        if (!message || (message.from !== 'user' && message.from !== 'ai')) {
            return null;
        }

        const text = String(message.text || '').trim();
        if (!text) {
            return null;
        }

        return {
            from: message.from,
            text
        };
    }

    function buildStarterThread(id = uid('chat')) {
        return {
            id,
            title: 'Nuevo chat',
            messages: [{ from: 'ai', text: getDefaultWelcomeMessage() }]
        };
    }

    function sanitizeThreads(rawThreads) {
        if (!Array.isArray(rawThreads)) {
            return [];
        }

        return rawThreads
            .map((thread) => {
                const messages = Array.isArray(thread?.messages)
                    ? thread.messages.map(normalizeThreadMessage).filter(Boolean)
                    : [];

                const sanitizedMessages = messages.length
                    ? messages
                    : [{ from: 'ai', text: getDefaultWelcomeMessage() }];

                const derivedTitle = sanitizedMessages.find((msg) => msg.from === 'user')?.text || 'Nuevo chat';

                return {
                    id: String(thread?.id || uid('chat')),
                    title: String(thread?.title || derivedTitle || 'Nuevo chat').trim() || 'Nuevo chat',
                    messages: sanitizedMessages
                };
            })
            .filter((thread, index, array) => thread.id && array.findIndex((item) => item.id === thread.id) === index);
    }

    function saveThreads() {
        try {
            localStorage.setItem(chatsKey, JSON.stringify(chatThreads));
            localStorage.setItem(historyKey, activeThreadId || '');
        } catch (error) {
            console.warn('No se pudo guardar el historial del chat:', error);
        }
    }

    function clearStoredThreads() {
        try {
            localStorage.removeItem(chatsKey);
            localStorage.removeItem(historyKey);
        } catch (error) {
            console.warn('No se pudo limpiar el historial corrupto del chat:', error);
        }
    }

    function shouldResetStoredThreads(rawStoredThreads, parsedThreads, sanitizedThreads) {
        if (!rawStoredThreads) {
            return false;
        }

        if (!Array.isArray(parsedThreads) || !sanitizedThreads.length) {
            return true;
        }

        if (parsedThreads.length !== sanitizedThreads.length) {
            return true;
        }

        return parsedThreads.some((thread, index) => {
            const sanitized = sanitizedThreads[index];
            if (!thread || !sanitized) {
                return true;
            }

            const originalMessages = Array.isArray(thread.messages) ? thread.messages : [];
            if (originalMessages.length !== sanitized.messages.length) {
                return true;
            }

            return sanitized.messages.some((message, messageIndex) => {
                const original = originalMessages[messageIndex];
                return !original || original.from !== message.from || String(original.text || '').trim() !== message.text;
            });
        });
    }

    function loadThreads() {
        let storedThreads = null;
        let storedActiveId = null;

        try {
            storedThreads = localStorage.getItem(chatsKey);
            storedActiveId = localStorage.getItem(historyKey);
        } catch (error) {
            console.warn('No se pudo leer el historial del chat:', error);
        }

        let parsedThreads = [];
        if (storedThreads) {
            parsedThreads = safeJsonParse(storedThreads, null);
            chatThreads = sanitizeThreads(parsedThreads);

            if (shouldResetStoredThreads(storedThreads, parsedThreads, chatThreads)) {
                clearStoredThreads();
                chatThreads = [];
                storedActiveId = null;
            }
        }

        if (!chatThreads.length) {
            const starterId = uid('chat');
            chatThreads = [buildStarterThread(starterId)];
            activeThreadId = starterId;
            saveThreads();
            return;
        }

        const existsActive = chatThreads.some((thread) => thread.id === storedActiveId);
        activeThreadId = existsActive ? storedActiveId : chatThreads[0].id;
        saveThreads();
    }

    function getActiveThread() {
        return chatThreads.find((thread) => thread.id === activeThreadId) || null;
    }

    function clearMessagesContainer() {
        while (chatMessages.firstChild) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }

    function createMessageElement(from, text, options = {}) {
        const message = document.createElement('div');
        message.className = `message ${from === 'user' ? 'user-message' : 'ai-message'}`;

        if (options.isStreaming) {
            message.classList.add('is-streaming');
        }

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = from === 'user' ? initials : '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';

        const p = document.createElement('p');
        p.textContent = text;
        content.appendChild(p);

        if (from === 'ai' && options.isStreaming) {
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.setAttribute('aria-label', 'La IA está escribiendo');
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            content.appendChild(typingIndicator);
        }

        message.appendChild(avatar);
        message.appendChild(content);
        return message;
    }

    function renderActiveMessages() {
        clearMessagesContainer();
        const thread = getActiveThread();
        if (!thread) return;

        thread.messages.forEach((msg) => {
            chatMessages.appendChild(createMessageElement(msg.from, msg.text));
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function renderHistory() {
        chatHistory.querySelectorAll('.chat-item').forEach((item) => item.remove());

        chatThreads.forEach((thread) => {
            const item = document.createElement('div');
            item.className = 'chat-item';
            if (thread.id === activeThreadId) item.classList.add('active');

            const titleSpan = document.createElement('span');
            titleSpan.textContent = thread.title;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-chat';
            deleteBtn.textContent = '✕';
            deleteBtn.type = 'button';

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                chatThreads = chatThreads.filter((t) => t.id !== thread.id);

                if (!chatThreads.length) {
                    const newId = uid('chat');
                    chatThreads = [{
                        id: newId,
                        title: 'Nuevo chat',
                        messages: [{ from: 'ai', text: getNewChatMessage() }]
                    }];
                    activeThreadId = newId;
                } else if (activeThreadId === thread.id) {
                    activeThreadId = chatThreads[0].id;
                }

                saveThreads();
                renderHistory();
                renderActiveMessages();
            });

            item.addEventListener('click', () => {
                activeThreadId = thread.id;
                saveThreads();
                renderHistory();
                renderActiveMessages();
            });

            item.appendChild(titleSpan);
            item.appendChild(deleteBtn);
            chatHistory.appendChild(item);
        });
    }

    function pushMessage(from, text) {
        const thread = getActiveThread();
        if (!thread) return;

        thread.messages.push({ from, text });

        if (from === 'user' && thread.title === 'Nuevo chat') {
            thread.title = text.slice(0, 34) + (text.length > 34 ? '...' : '');
        }

        saveThreads();
        renderHistory();
        renderActiveMessages();
    }

    function getApiBaseCandidates() {
        const currentOrigin = window.location.origin;
        const hostname = window.location.hostname || 'localhost';
        const isHttpOrigin = /^https?:/i.test(window.location.protocol);
        const requestProtocol = isHttpOrigin ? window.location.protocol : 'http:';
        const candidates = [];

        if (isHttpOrigin && currentOrigin && currentOrigin !== 'null') {
            candidates.push(currentOrigin);
        }

        ['5501', '5502', '5503'].forEach((port) => {
            const candidate = `${requestProtocol}//${hostname}:${port}`;
            if (!candidates.includes(candidate)) {
                candidates.push(candidate);
            }
        });

        return candidates;
    }

    async function fetchApi(path, options) {
        let lastError = null;

        for (const base of getApiBaseCandidates()) {
            try {
                const response = await fetch(`${base}${path}`, options);
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

    function setSendingState(state) {
        isSending = state;
        sendBtn.disabled = state;
        chatInput.disabled = state;
        sendBtn.textContent = state ? 'Generando...' : 'Enviar';
    }

    function createStreamingAiMessage() {
        const thread = getActiveThread();
        if (!thread) return null;

        const aiMessage = { from: 'ai', text: '' };
        thread.messages.push(aiMessage);
        const messageIndex = thread.messages.length - 1;

        saveThreads();
        renderHistory();

        const messageElement = createMessageElement('ai', '', { isStreaming: true });
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return {
            threadId: thread.id,
            messageIndex,
            messageElement,
            textNode: messageElement.querySelector('.message-content p'),
            typingIndicator: messageElement.querySelector('.typing-indicator')
        };
    }

    function getStreamStateMessage(streamState) {
        if (!streamState) return null;
        const thread = chatThreads.find((t) => t.id === streamState.threadId);
        if (!thread) return null;
        return thread.messages[streamState.messageIndex] || null;
    }

    function setStreamStateText(streamState, text) {
        const message = getStreamStateMessage(streamState);
        if (!message) return;

        message.text = String(text || '');

        const canPatchDomDirectly =
            activeThreadId === streamState.threadId &&
            streamState.textNode &&
            streamState.messageElement &&
            chatMessages.contains(streamState.messageElement);

        if (canPatchDomDirectly) {
            streamState.textNode.textContent = message.text;
            if (streamState.typingIndicator) {
                streamState.typingIndicator.hidden = Boolean(message.text);
            }
            streamState.messageElement.classList.toggle('has-content', Boolean(message.text));
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else if (activeThreadId === streamState.threadId) {
            renderActiveMessages();
        }
    }

    function appendStreamStateText(streamState, chunk) {
        const message = getStreamStateMessage(streamState);
        if (!message) return;
        setStreamStateText(streamState, `${message.text}${String(chunk || '')}`);
    }

    function finalizeStreamingAiMessage(streamState) {
        if (!streamState) return;

        const message = getStreamStateMessage(streamState);
        if (!message) return;

        message.text = String(message.text || '').trim() || 'No tengo una respuesta en este momento.';
        saveThreads();

        if (activeThreadId === streamState.threadId) {
            renderActiveMessages();
        }
    }

    async function parseErrorResponse(response) {
        try {
            const data = await response.json();
            return data.reply || data.error || 'Error del servidor de IA.';
        } catch {
            return 'Error del servidor de IA.';
        }
    }

    async function askServer(messageText) {
        const response = await fetchApi('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });

        let data = {};
        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw new Error(data.reply || data.error || 'Error del servidor de IA.');
        }

        return String(data.reply || 'No tengo una respuesta en este momento.');
    }

    async function askServerStreaming(messageText, handlers = {}) {
        const response = await fetchApi('/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });

        if (!response.ok) {
            const errorMessage = await parseErrorResponse(response);
            throw new Error(errorMessage);
        }

        const contentType = String(response.headers.get('content-type') || '').toLowerCase();
        if (!contentType.includes('text/event-stream')) {
            const fallbackReply = await askServer(messageText);
            handlers.onChunk?.(fallbackReply);
            handlers.onDone?.();
            return;
        }

        if (!response.body) {
            throw new Error('Tu navegador no soporta streaming en esta conexión.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        const processEventBlock = (block) => {
            const lines = block.split('\n');
            let eventName = 'message';
            const dataLines = [];

            for (const line of lines) {
                if (line.startsWith('event:')) {
                    eventName = line.slice(6).trim() || 'message';
                } else if (line.startsWith('data:')) {
                    dataLines.push(line.slice(5).trim());
                }
            }

            if (!dataLines.length) return;

            let payload = {};
            try {
                payload = JSON.parse(dataLines.join('\n'));
            } catch {
                payload = { text: dataLines.join('\n') };
            }

            if (eventName === 'chunk') {
                handlers.onChunk?.(String(payload.text || ''));
            } else if (eventName === 'error') {
                throw new Error(payload.message || 'Error del servidor de IA.');
            } else if (eventName === 'done') {
                handlers.onDone?.();
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const blocks = buffer.split('\n\n');
            buffer = blocks.pop() || '';

            for (const block of blocks) {
                processEventBlock(block);
            }
        }

        if (buffer.trim()) {
            processEventBlock(buffer);
        }
    }

    async function sendMessage() {
        if (isSending) return;

        const messageText = chatInput.value.trim();
        if (!messageText) return;

        chatInput.value = '';
        pushMessage('user', messageText);
        setSendingState(true);

        const streamState = createStreamingAiMessage();

        try {
            try {
                await askServerStreaming(messageText, {
                    onChunk: (chunk) => appendStreamStateText(streamState, chunk)
                });
            } catch (streamError) {
                console.warn('Streaming no disponible, usando fallback clásico:', streamError);
                const reply = await askServer(messageText);
                setStreamStateText(streamState, reply);
            }

            finalizeStreamingAiMessage(streamState);
        } catch (error) {
            console.error('Error IA chat:', error);
            setStreamStateText(streamState, error.message || 'Error al conectar con el servidor.');
            finalizeStreamingAiMessage(streamState);
        } finally {
            setSendingState(false);
            chatInput.focus();
        }
    }

    suggestionButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.textContent || '';
            sendMessage();
        });
    });

    newChatBtn.addEventListener('click', () => {
        const id = uid('chat');
        const thread = {
            id,
            title: 'Nuevo chat',
            messages: [{ from: 'ai', text: getNewChatMessage() }]
        };
        chatThreads.unshift(thread);
        activeThreadId = id;
        saveThreads();
        renderHistory();
        renderActiveMessages();
        chatInput.focus();
    });

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    loadThreads();
    renderHistory();
    renderActiveMessages();
});