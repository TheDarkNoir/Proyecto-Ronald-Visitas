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