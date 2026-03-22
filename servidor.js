require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

const path = require('path');
// servir archivos estáticos desde la raíz del proyecto
app.use(express.static(__dirname));

const supabaseUrl =  process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const port = 3000;

// servir index.html en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
});

// Registrar usuario en tabla Usuario de Supabase
app.post('/registrar', async (req, res) => {
    try {
        const { username, user, password } = req.body;
        if (!username || !user || !password) {
            return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
        }

        // verificar si el correo ya existe
        const { data: existingUser } = await supabase
            .from('Usuario')
            .select('correo_usuario')
            .eq('correo_usuario', user)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // insertar en tabla Usuario
        const { data, error } = await supabase
            .from('Usuario')
            .insert([{
                correo_usuario: user,
                nombre_usuario: username,
                contraseña_usuario: hashedPassword,
                rol_usuario: 'cliente'
            }]);

        if (error) {
            console.error('Error durante el registro: ', error);
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({ message: 'Usuario registrado correctamente. ¡Bienvenido a Tropical Travel!' });
    } catch (error) {
        console.error('Server error: ', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login usando tabla Usuario
app.post('/login', async (req, res) => {
    try {
        const { user, password } = req.body;
        if (!user || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        // buscar usuario en tabla Usuario
        const { data: usuarioData, error: queryError } = await supabase
            .from('Usuario')
            .select('*')
            .eq('correo_usuario', user)
            .single();

        if (queryError || !usuarioData) {
            console.error('Usuario no encontrado:', queryError);
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // validar contraseña
        const isPasswordValid = await bcrypt.compare(password, usuarioData.contraseña_usuario);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // generar token simple (puede mejorar con JWT)
        const token = Buffer.from(user + ':' + Date.now()).toString('base64');

        res.status(200).json({
            message: 'Inicio de sesión exitoso!',
            token,
            username: usuarioData.nombre_usuario,
            userId: usuarioData.id,
            rol: usuarioData.rol_usuario
        });
    } catch (error) {
        console.error('Server error:', error);
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
                duration: duration
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
        const { userId } = req.params;
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

        // Mapear los datos
        const reservasFormateadas = data.map(reserva => ({
            id: reserva.id,
            title: reserva.Destinos.nombre,
            location: `${reserva.Destinos.ciudad}, ${reserva.Destinos.pais}`,
            date: reserva.fecha_reserva || 'Fecha por confirmar',
            status: reserva.estado,
            price: 0, // Se puede agregar precio a Reservaciones o calcular
            image: '/Imagenes/default.jpg', // Mapear imagen
            rating: 4.5,
            description: reserva.Destinos.descripcion
        }));

        res.json(reservasFormateadas);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});