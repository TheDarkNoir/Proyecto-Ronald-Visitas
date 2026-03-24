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
            .select('id, nombre, pais, ciudad, descripcion, clima, longitud, latitud')
            .eq('activo', true);

        if (error) {
            console.error('Error obteniendo destinos:', error);
            return res.status(500).json({ error: error.message });
        }

        // Mapear los datos para que coincidan con el formato esperado
        const destinosFormateados = data.map(destino => {
            // Mapear imágenes conocidas
            const imageMap = {
                'Cartagena de Indias': '/Imagenes/cartagenaimg.jpg',
                'Parque Tayrona': '/Imagenes/Tayrona.jpg',
                'Valle de Cocora': '/Imagenes/valle-de-cocora.jpeg',
                'Cañón del Chicamocha': '/Imagenes/chicamocha.jpg',
                'Eje Cafetero': '/Imagenes/eje cafe.jpg',
                'San Andrés Islas': '/Imagenes/san andre.jpg'
            };
            const image = imageMap[destino.nombre] || '/Imagenes/default.jpg';

            // Mapear precios conocidos
            const priceMap = {
                'Cartagena de Indias': 450000,
                'Parque Tayrona': 320000,
                'Valle de Cocora': 280000,
                'Cañón del Chicamocha': 390000,
                'Eje Cafetero': 360000,
                'San Andrés Islas': 520000
            };
            const price = priceMap[destino.nombre] || 0;

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
                Destinos(id, nombre, ciudad, pais, descripcion)
            `)
            .eq('user_id', userId);

        if (error) {
            console.error('Error obteniendo reservas:', error);
            return res.status(500).json({ error: error.message });
        }

        const reservasFormateadas = (data || []).map((reserva) => {
            const destino = Array.isArray(reserva.Destinos) ? reserva.Destinos[0] : reserva.Destinos;
            const nombreDestino = destino?.nombre || 'Destino pendiente';
            const ciudad = destino?.ciudad || 'Ubicación';
            const pais = destino?.pais || 'Por confirmar';

            return {
                id: reserva.id,
                title: nombreDestino,
                location: `${ciudad}, ${pais}`,
                date: reserva.fecha_reserva || 'Fecha por confirmar',
                status: normalizeReservationStatus(reserva.estado),
                price: 0,
                image: getDestinationImage(nombreDestino),
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

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});