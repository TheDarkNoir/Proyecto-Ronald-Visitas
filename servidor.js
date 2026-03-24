require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const port = Number(process.env.PORT) || 5501;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_ANON_KEY en el entorno.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const imageMap = {
    'Cartagena de Indias': '/Imagenes/cartagenaimg.jpg',
    'Parque Tayrona': '/Imagenes/Tayrona.jpg',
    'Valle de Cocora': '/Imagenes/valle-de-cocora.jpeg',
    'Cañón del Chicamocha': '/Imagenes/chicamocha.jpg',
    'Eje Cafetero': '/Imagenes/eje cafe.jpg',
    'San Andrés Islas': '/Imagenes/san andre.jpg'
};

function getDestinationImage(nombre) {
    return imageMap[nombre] || '/Imagenes/cartagenaimg.jpg';
}

function normalizeAssetUrl(url) {
    const value = String(url || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
    return '/' + value.replace(/^\.?\//, '');
}

async function getDestinationUiImageMap(destinationIds = []) {
    const uniqueIds = [...new Set((destinationIds || []).filter(Boolean))];
    if (!uniqueIds.length) return {};

    const { data, error } = await supabase
        .from('Destino_ui')
        .select('destination_id, tipo, url, orden')
        .in('destination_id', uniqueIds)
        .eq('tipo', 'image')
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error obteniendo assets Destino_ui:', error);
        return {};
    }

    const imageByDestinationId = {};
    for (const row of data || []) {
        if (!row?.destination_id || imageByDestinationId[row.destination_id]) continue;
        const normalizedUrl = normalizeAssetUrl(row.url);
        if (normalizedUrl) imageByDestinationId[row.destination_id] = normalizedUrl;
    }

    return imageByDestinationId;
}

function normalizeReservationStatus(estado) {
    const normalized = String(estado || '').trim().toLowerCase();

    if (['confirmada', 'confirmed', 'completado', 'completed'].includes(normalized)) {
        return 'confirmed';
    }

    if (['cancelada', 'cancelled', 'canceled'].includes(normalized)) {
        return 'cancelled';
    }

    return 'pending';
}

function buildChatReply(rawMessage) {
    const msg = String(rawMessage || '').trim().toLowerCase();

    if (/cartagena/i.test(msg)) {
        return '🏖️ **Cartagena de Indias** es uno de los destinos más icónicos de Colombia. Su ciudad amurallada, playas del Rosario y vibrante vida nocturna la hacen perfecta todo el año. La mejor época es de diciembre a abril. ¿Te gustaría un itinerario detallado?';
    }

    if (/tayrona/i.test(msg)) {
        return '🌿 El **Parque Tayrona** combina selva tropical con playas vírgenes. La entrada está en $200.000 COP en nuestros paquetes. Lo mejor es ir de enero a marzo o de julio a agosto (temporadas secas). Lleva repelente y ropa ligera. ¿Cuántos días planeas quedarte?';
    }

    if (/cocora|eje cafetero|salento|quindío/i.test(msg)) {
        return '☕ El **Eje Cafetero** es mágico: palmas de cera en el Valle del Cocora, haciendas cafeteras y el pintoresco Salento. Ideal para 3-4 días. El clima es fresco (16-22°C). ¿Quieres un itinerario sugerido?';
    }

    if (/san andrés/i.test(msg)) {
        return '🐠 **San Andrés** es un paraíso del Caribe con el famoso mar de los siete colores. Ideal para buceo, snorkel y vida marina. Mejor época: diciembre a abril. ¿Necesitas info sobre vuelos o alojamiento?';
    }

    if (/chicamocha|santander/i.test(msg)) {
        return '🏔️ El **Cañón del Chicamocha** en Santander es espectacular: teleférico, parapente y caminatas entre formaciones rocosas únicas. ¿Deseas info sobre actividades y costos?';
    }

    if (/playa|mar|costa|caribe|buceo|snorkel/i.test(msg)) {
        return '🏝️ Para destinos de playa en Colombia te recomiendo:\n• **Cartagena** – historia + playas (disponible ahora)\n• **Tayrona** – selva y mar ($200.000 COP)\n• **San Andrés** – aguas cristalinas del Caribe\n• **Capurganá** – paraíso sin carreteras\n¿Cuál te llama más la atención?';
    }

    if (/aventura|senderismo|montaña|naturaleza|trekking|ecolog/i.test(msg)) {
        return '⛰️ Los mejores destinos de aventura en Colombia:\n• **Tayrona** – trekking entre selva y playa\n• **Valle de Cocora** – caminatas entre palmas gigantes\n• **Chicamocha** – parapente y canopy\n• **Sierra Nevada** – picos nevados\n¿Qué nivel de dificultad prefieres?';
    }

    if (/cultura|historia|colonial|museo|patrimonio/i.test(msg)) {
        return '🏛️ Para cultura e historia en Colombia:\n• **Cartagena** – ciudad amurallada Patrimonio UNESCO\n• **Santa Marta** – ciudad más antigua de Sudamérica\n• **Bogotá** – Museo del Oro y La Candelaria\n• **Popayán** – la "ciudad blanca" colonial\n¿Te interesa alguno en especial?';
    }

    if (/presupuesto|precio|costo|cuánto|económico|barato|dinero|pesos/i.test(msg)) {
        return '💰 Guía de presupuestos para Colombia:\n• **Económico** ($300k-500k/día): hostales, transporte local\n• **Moderado** ($500k-1M/día): hoteles 3★, tours incluidos\n• **Premium** (+$1M/día): hoteles boutique, experiencias privadas\n\nNuestros destinos van desde **$0 COP** (Cartagena) hasta **$200.000 COP** (Tayrona). ¿Cuál se ajusta a tu presupuesto?';
    }

    if (/itinerario|días?|semana|plan de viaje|cuántos días/i.test(msg)) {
        return '📅 Puedo ayudarte con un itinerario. Para darte el mejor plan necesito saber:\n1. ¿Cuántos días tienes disponibles?\n2. ¿Qué tipo de experiencia buscas? (playa, aventura, cultura)\n3. ¿Viajas solo, en pareja o en grupo?\n\n¡Con eso te armo el plan perfecto!';
    }

    if (/clima|temperatura|lluvia|temporada|época|cuándo viajar/i.test(msg)) {
        return '🌤️ El clima en Colombia varía mucho según la región:\n• **Costa Caribe** (Cartagena, Tayrona): seco dic-abr y jul-ago\n• **Eje Cafetero**: fresco todo el año, lluvias en abr-may y oct-nov\n• **Amazonía**: cálido y húmedo durante todo el año\nEn general, diciembre-enero y junio-agosto son los mejores meses. ¿Qué región te interesa?';
    }

    if (/hotel|hostal|alojamiento|dormir|hospedaje/i.test(msg)) {
        return '🏨 Opciones de alojamiento en Colombia:\n• **Hostales** (~$50k-100k/noche): ideal para mochileros\n• **Hoteles 3★** (~$150k-300k/noche): comodidad estándar\n• **Hoteles boutique** (~$400k+/noche): experiencia premium\n• **Ecohoteles**: perfectos para Tayrona y Cocora\n¿Para qué destino buscas alojamiento?';
    }

    if (/vuelo|avión|bus|transporte|llegar|cómo ir/i.test(msg)) {
        return '✈️ Opciones de transporte en Colombia:\n• **Vuelos internos**: Avianca, LATAM, Wingo (~$80k-250k)\n• **Bus intermunicipal**: económico y cómodo ($30k-80k)\n• **Taxi/Uber**: disponible en ciudades principales\n• **Alquiler de auto**: ideal para el Eje Cafetero\n¿A qué destino necesitas llegar?';
    }

    if (/recomiend|suger|mejor destino|dónde ir|qué visitar|destino/i.test(msg)) {
        return '🌟 Los destinos disponibles ahora en Tropical Travel:\n\n1. 🏖️ **Cartagena de Indias** – Historia, cultura y playas\n2. 🌿 **Parque Tayrona** – Naturaleza y aventura ($200.000 COP)\n\nPuedes agregar cualquiera a tu lista en la sección **Explorar**. ¿Cuál te interesa más?';
    }

    if (/hola|buenos|buenas|hey|saludos/i.test(msg)) {
        return '¡Hola! 👋 Soy tu asistente de viajes de Tropical Travel. Estoy aquí para ayudarte a planear la aventura perfecta por Colombia. ¿A dónde te gustaría viajar?';
    }

    if (/gracias|perfecto|excelente|genial|buenísimo/i.test(msg)) {
        return '¡Con mucho gusto! 😊 Es un placer ayudarte. ¿Hay algo más en lo que pueda ayudarte? Recuerda que puedes reservar tus destinos favoritos en la sección **Explorar**.';
    }

    const fallbacks = [
        '¿Puedes contarme más sobre el viaje que tienes en mente? Puedo ayudarte con destinos, presupuestos, itinerarios y clima. ✈️',
        'Para orientarte mejor, ¿qué tipo de experiencia buscas: playa, aventura o cultura? 🗺️',
        'Me encantaría ayudarte a planear tu viaje. ¿Tienes algún destino en mente o prefieres que te recomiende según tus preferencias? 🌴',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function splitReplyForStreaming(text) {
    const words = String(text || '').split(/(\s+)/).filter(Boolean);
    const chunks = [];
    let current = '';

    for (const word of words) {
        current += word;
        if (current.length >= 26 || /\n/.test(word)) {
            chunks.push(current);
            current = '';
        }
    }

    if (current) chunks.push(current);
    return chunks.length ? chunks : [String(text || '')];
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// servir index.html en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Registrar usuario en tabla Usuarios de Supabase
app.post('/registrar', async (req, res) => {
    try {
        const nombre = String(req.body?.nombre || '').trim();
        const email = String(req.body?.email || '').trim().toLowerCase();
        const password = String(req.body?.password || '');

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
        }

        const { data: existingUser, error: existingUserError } = await supabase
            .from('Usuarios')
            .select('id, email')
            .eq('email', email)
            .maybeSingle();

        if (existingUserError) {
            console.error('Error verificando usuario existente:', existingUserError);
            return res.status(500).json({ error: 'No se pudo validar el correo registrado.' });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const telefono = String(req.body?.telefono || '').trim();
        const pais = String(req.body?.pais || 'Colombia').trim();
        const ciudad = String(req.body?.ciudad || '').trim();
        const fecha_nacimiento = req.body?.fecha_nacimiento || null;

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertData = { email, nombre, password: hashedPassword, rol: 'cliente' };
        if (telefono) insertData.telefono = telefono;
        if (pais) insertData.pais = pais;
        if (ciudad) insertData.ciudad = ciudad;
        if (fecha_nacimiento) insertData.fecha_nacimiento = fecha_nacimiento;

        const { data: createdUser, error: createError } = await supabase
            .from('Usuarios')
            .insert(insertData)
            .select('id, email, nombre, rol')
            .single();

        if (createError) {
            console.error('Error durante el registro:', createError);
            return res.status(400).json({ error: createError.message });
        }

        res.status(201).json({
            message: 'Usuario registrado correctamente. ¡Bienvenido a Tropical Travel!',
            user: createdUser
        });
    } catch (error) {
        console.error('Server error en /registrar:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login usando tabla Usuarios
app.post('/login', async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const password = String(req.body?.password || '');

        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        console.log('Buscando usuario con email:', email);

        const { data: usuarioData, error: queryError } = await supabase
            .from('Usuarios')
            .select('id, email, nombre, password, rol')
            .eq('email', email)
            .maybeSingle();

        if (queryError) {
            console.error('Error consultando usuario:', queryError);
            return res.status(500).json({ error: 'No se pudo consultar el usuario.' });
        }

        if (!usuarioData) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        let isPasswordValid = false;
        if (usuarioData.password && usuarioData.password.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, usuarioData.password);
        } else {
            isPasswordValid = password === usuarioData.password;
        }

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = Buffer.from(`${usuarioData.id}:${Date.now()}`).toString('base64');
        res.status(200).json({
            message: 'Inicio de sesión exitoso!',
            token,
            username: usuarioData.nombre,
            userId: usuarioData.id,
            email: usuarioData.email,
            rol: usuarioData.rol || 'cliente'
        });
    } catch (error) {
        console.error('Server error en /login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Endpoint para obtener destinos
app.get('/destinos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Destinos')
            .select('id, nombre, pais, ciudad, descripcion, clima, longitud, latitud, precio')
            .eq('activo', true);

        if (error) {
            console.error('Error obteniendo destinos:', error);
            return res.status(500).json({ error: error.message });
        }

        const imageByDestinationId = await getDestinationUiImageMap((data || []).map((destino) => destino.id));

        // Mapear los datos para que coincidan con el formato esperado
        const destinosFormateados = data.map(destino => {
            const image = imageByDestinationId[destino.id] || getDestinationImage(destino.nombre);

            const dbPrice = Number(destino.precio);
            const price = Number.isFinite(dbPrice) ? dbPrice : 0;

            // Mapear ratings conocidos
            const ratingMap = {
                'Cartagena de Indias': 4.9,
                'Parque Tayrona': 4.5,
                'Valle de Cocora': 4.8,
                'Cañón del Chicamocha': 4.7,
                'Eje Cafetero': 4.6,
                'San Andrés Islas': 4.9
            };
            const rating = ratingMap[destino.nombre] || 4.5;

            // Mapear dificultad
            const difficultyMap = {
                'Cartagena de Indias': 'FÁCIL',
                'Parque Tayrona': 'MODERADO',
                'Valle de Cocora': 'DIFÍCIL',
                'Cañón del Chicamocha': 'MODERADO',
                'Eje Cafetero': 'FÁCIL',
                'San Andrés Islas': 'FÁCIL'
            };
            const difficulty = difficultyMap[destino.nombre] || 'MODERADO';

            // Mapear duración
            const durationMap = {
                'Cartagena de Indias': '3-4 DÍAS',
                'Parque Tayrona': '2-3 DÍAS',
                'Valle de Cocora': '1 DÍA',
                'Cañón del Chicamocha': '2 DÍAS',
                'Eje Cafetero': '2-3 DÍAS',
                'San Andrés Islas': '3-5 DÍAS'
            };
            const duration = durationMap[destino.nombre] || '2-3 DÍAS';
            const categoriaMap = {
                'Cartagena de Indias': 'playa',
                'Parque Tayrona': 'playa',
                'Valle de Cocora': 'naturaleza',
                'Cañón del Chicamocha': 'aventura',
                'Eje Cafetero': 'naturaleza',
                'San Andrés Islas': 'playa'
            };
            const categoria = categoriaMap[destino.nombre] || 'cultura';

            return {
                id: destino.id,
                title: destino.nombre,
                location: `${destino.ciudad}, ${destino.pais}`,
                description: destino.descripcion,
                clima: destino.clima,
                image: image,
                price: price,
                rating: rating,
                difficulty: difficulty,
                duration: duration,
                categoria: categoria
            };
        });

        res.json(destinosFormateados);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para obtener reservas del usuario
app.get('/reservas/:userId', async (req, res) => {
    try {
        const userId = String(req.params?.userId || '').trim();
        if (!userId) {
            return res.status(400).json({ error: 'El identificador del usuario es requerido.' });
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (!isUuid) {
            return res.status(400).json({ error: 'El identificador del usuario no tiene un formato válido.' });
        }

        const { data, error } = await supabase
            .from('Reservaciones')
            .select(`
                id,
                estado,
                fecha_reserva,
                creado_en,
                Destinos(id, nombre, ciudad, pais, descripcion, precio)
            `)
            .eq('user_id', userId);

        if (error) {
            console.error('Error obteniendo reservas:', error);
            return res.status(500).json({ error: error.message });
        }

        const destinationIds = (data || [])
            .map((reserva) => {
                const destino = Array.isArray(reserva.Destinos) ? reserva.Destinos[0] : reserva.Destinos;
                return destino?.id || null;
            })
            .filter(Boolean);

        const imageByDestinationId = await getDestinationUiImageMap(destinationIds);

        const reservasFormateadas = (data || []).map((reserva) => {
            const destino = Array.isArray(reserva.Destinos) ? reserva.Destinos[0] : reserva.Destinos;
            const nombreDestino = destino?.nombre || 'Destino pendiente';
            const ciudad = destino?.ciudad || 'Ubicación';
            const pais = destino?.pais || 'Por confirmar';
            const dbPrice = Number(destino?.precio);
            const price = Number.isFinite(dbPrice) ? dbPrice : 0;
            const image = (destino?.id && imageByDestinationId[destino.id]) || getDestinationImage(nombreDestino);

            return {
                id: reserva.id,
                title: nombreDestino,
                location: `${ciudad}, ${pais}`,
                date: reserva.fecha_reserva || 'Fecha por confirmar',
                status: normalizeReservationStatus(reserva.estado),
                price,
                image,
                rating: 4.5,
                description: destino?.descripcion || 'Sin descripción disponible.'
            };
        });

        res.json(reservasFormateadas);
    } catch (error) {
        console.error('Server error en /reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para obtener el perfil del usuario
app.get('/perfil/:userId', async (req, res) => {
    try {
        const userId = String(req.params?.userId || '').trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (!isUuid) return res.status(400).json({ error: 'ID de usuario no válido.' });

        const { data, error } = await supabase
            .from('Usuarios')
            .select('id, nombre, email, rol, pais, telefono, fecha_nacimiento, ciudad, created_at')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error obteniendo perfil:', error);
            return res.status(500).json({ error: error.message });
        }
        if (!data) return res.status(404).json({ error: 'Usuario no encontrado.' });

        res.json(data);
    } catch (error) {
        console.error('Server error en /perfil GET:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Endpoint para actualizar el perfil del usuario
app.put('/perfil/:userId', async (req, res) => {
    try {
        const userId = String(req.params?.userId || '').trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (!isUuid) return res.status(400).json({ error: 'ID de usuario no válido.' });

        const nombre = String(req.body?.nombre || '').trim();
        const telefono = String(req.body?.telefono || '').trim();
        const pais = String(req.body?.pais || '').trim();
        const ciudad = String(req.body?.ciudad || '').trim();
        const fecha_nacimiento = req.body?.fecha_nacimiento || null;

        if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });

        const updates = { nombre, updated_at: new Date().toISOString() };
        if (telefono) updates.telefono = telefono;
        if (pais) updates.pais = pais;
        if (ciudad) updates.ciudad = ciudad;
        if (fecha_nacimiento) updates.fecha_nacimiento = fecha_nacimiento;

        const { data, error } = await supabase
            .from('Usuarios')
            .update(updates)
            .eq('id', userId)
            .select('id, nombre, email, rol, pais, telefono, fecha_nacimiento, ciudad')
            .single();

        if (error) {
            console.error('Error actualizando perfil:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: 'Perfil actualizado correctamente.', user: data });
    } catch (error) {
        console.error('Server error en /perfil PUT:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Endpoint para listar usuarios en comunidad
app.get('/usuarios', async (req, res) => {
    try {
        const search = String(req.query?.search || '').trim();
        const excludeUserId = String(req.query?.excludeUserId || '').trim();

        let query = supabase
            .from('Usuarios')
            .select('id, nombre, email, foto, rol')
            .eq('rol', 'cliente')
            .order('nombre', { ascending: true })
            .limit(80);

        if (excludeUserId) {
            query = query.neq('id', excludeUserId);
        }

        if (search) {
            query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error obteniendo usuarios:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json((data || []).map((u) => ({
            id: u.id,
            nombre: u.nombre,
            email: u.email,
            foto: u.foto || null
        })));
    } catch (error) {
        console.error('Server error en /usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// ─── IA CHAT ─────────────────────────────────────────────────────────────────
app.post('/chat', (req, res) => {
    const raw = String(req.body?.message || '').trim();
    if (!raw) {
        return res.status(400).json({ reply: 'Por favor escribe un mensaje.' });
    }
    const reply = buildChatReply(raw);

    res.json({ reply });
});

app.post('/chat/stream', async (req, res) => {
    const raw = String(req.body?.message || '').trim();
    if (!raw) {
        return res.status(400).json({ reply: 'Por favor escribe un mensaje.' });
    }

    const reply = buildChatReply(raw);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
    }

    let closed = false;
    req.on('close', () => {
        closed = true;
    });

    const sendEvent = (event, payload) => {
        if (closed || res.writableEnded) return;
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    sendEvent('start', { ok: true });

    try {
        const chunks = splitReplyForStreaming(reply);
        for (const chunk of chunks) {
            if (closed || res.writableEnded) return;
            sendEvent('chunk', { text: chunk });
            await wait(35 + Math.floor(Math.random() * 45));
        }

        sendEvent('done', { ok: true });
        if (!res.writableEnded) {
            res.end();
        }
    } catch (error) {
        console.error('Error en /chat/stream:', error);
        sendEvent('error', { message: 'Error del servidor de IA.' });
        if (!res.writableEnded) {
            res.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});