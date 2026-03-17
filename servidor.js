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

// Registrar usuario en tabla usuarios de Supabase
app.post('/registrar', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
        }

        const lowerEmail = email.toLowerCase();
        const { data: existingUser, error: existsError } = await supabase
            .from('Usuarios')
            .select('email')
            .eq('email', lowerEmail)
            .limit(1);

        if (existsError) {
            return res.status(500).json({ error: existsError.message });
        }
        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('Usuarios')
            .insert([{ nombre, email: lowerEmail, password: hashedPassword, rol: 'cliente', foto: null }])
            .select('*');

        if (error) {
            console.error('Error durante el registro: ', error);
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({ message: 'Usuario registrado correctamente. ¡Bienvenido a Tropical Travel!', user: data[0] });
    } catch (error) {
        console.error('Server error: ', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login usando tabla usuarios
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        const lowerEmail = email.toLowerCase();
        const { data: userData, error: queryError } = await supabase
            .from('Usuarios')
            .select('*')
            .eq('email', lowerEmail)
            .limit(1);

        if (queryError || !userData || !Array.isArray(userData) || userData.length === 0) {
            console.error('Usuario no encontrado:', queryError);
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        const user = userData[0];
        const isPasswordValid = await bcrypt.compare(password, user.password || '');
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
        res.status(200).json({
            message: 'Inicio de sesión exitoso!',
            token,
            username: user.nombre,
            userId: user.id,
            rol: user.rol
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Validación de esquema rápido para tablas importantes
app.get('/validate-schema', async (req, res) => {
    const tables = [
        { name: 'Usuarios', checks: ['id', 'nombre', 'email', 'rol', 'password'] },
        { name: 'Destinos', checks: ['id', 'nombre_destino', 'ubicacion', 'precio', 'estado'] },
        { name: 'Reservaciones', checks: ['id', 'usuario_id', 'destino_id', 'fecha_reserva', 'estado'] }
    ];

    const results = [];
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table.name).select('*').limit(1);
            if (error) {
                results.push({ table: table.name, exists: false, error: error.message });
                continue;
            }
            const sample = data && data[0] ? Object.keys(data[0]) : [];
            const missing = table.checks.filter(c => !sample.includes(c));
            results.push({ table: table.name, exists: true, missingColumns: missing, sampleColumns: sample });
        } catch (err) {
            results.push({ table: table.name, exists: false, error: err.message });
        }
    }
    res.json(results);
});

// Sembrar registros de ejemplo para mostrar destinos y reservas
app.post('/seed-demo', async (req, res) => {
    try {
        await supabase.from('Reservaciones').delete().neq('id', '');
        await supabase.from('Destinos').delete().neq('id', '');
        await supabase.from('Usuarios').delete().neq('id', '');

        const usuariosDemo = [
            { nombre: 'María Rodríguez', email: 'maria@demo.com', password: await bcrypt.hash('Demo1234', 10), rol: 'cliente', foto: null },
            { nombre: 'Carlos Méndez', email: 'carlos@demo.com', password: await bcrypt.hash('Demo1234', 10), rol: 'cliente', foto: null }
        ];
        const { data: usuarios, error: usuarioError } = await supabase.from('Usuarios').upsert(usuariosDemo, { onConflict: 'email' }).select('*');
        if (usuarioError) return res.status(500).json({ error: usuarioError.message });

        const destinosDemo = [
            { nombre_destino: 'Cartagena de Indias', ubicacion: 'Bolívar', precio: 450000 },
            { nombre_destino: 'Parque Tayrona', ubicacion: 'Magdalena', precio: 320000 }
        ];
        const { data: destinos, error: destinoError } = await supabase.from('Destinos').insert(destinosDemo).select('*');
        if (destinoError) return res.status(500).json({ error: destinoError.message });

        if (usuarios?.length >= 2 && destinos?.length >= 2) {
            const usersByEmail = {};
            usuarios.forEach(u => { usersByEmail[u.email] = u; });
            if (destinos.length > 0 && usuarios.length > 0) {
                await supabase.from('Reservaciones').insert([
                    { usuario_id: usuarios[0].id, destino_id: destinos[0].id, fecha_reserva: '2025-03-15', estado: 'confirmada', precio_total: destinos[0].precio || 0 },
                    { usuario_id: usuarios[Math.min(1, usuarios.length -1)].id, destino_id: destinos[Math.min(1, destinos.length -1)].id, fecha_reserva: '2025-03-20', estado: 'pending', precio_total: destinos[Math.min(1, destinos.length -1)].precio || 0 }
                ]);
            }
        }

        res.json({ message: 'Semilla demo ejecutada.' });
    } catch (error) {
        console.error('seed-demo error:', error);
        res.status(500).json({ error: 'Error interno al sembrar datos demo.' });
    }
});

// API destinos
app.get('/destinos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('Destinos').select('*');
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar destinos.' });
    }
});

// Reservas por usuario
app.get('/mis-viajes', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ error: 'userId es requerido.' });

        const queryFields = ['usuario_id', 'id_usuario', 'user_id'];
        let data = [];
        let error = null;
        for (const field of queryFields) {
            const q = await supabase.from('Reservaciones').select('*').eq(field, userId).order('fecha_reserva', { ascending: false });
            if (!q.error) {
                data = q.data || [];
                error = null;
                break;
            }
            error = q.error;
            if (!/does not exist/.test((q.error.message || '').toLowerCase())) {
                break;
            }
        }
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener reservas.' });
    }
});

app.post('/reserva', async (req, res) => {
    try {
        const { usuario_id, destino_id, fecha_reserva, precio_total } = req.body;
        if (!usuario_id || !destino_id || !fecha_reserva) {
            return res.status(400).json({ error: 'usuario_id, destino_id y fecha_reserva son requeridos' });
        }

        const { data, error } = await supabase.from('Reservaciones').insert([{ usuario_id, destino_id, fecha_reserva, precio_total, estado: 'pending' }]).select('*');
        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Reserva creada exitosamente.', reserva: data[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear reserva.' });
    }
});

app.get('/perfil', async (req, res) => {
    try {
        const userId = Number(req.query.userId);
        if (!userId) return res.status(400).json({ error: 'userId es requerido.' });

        const { data, error } = await supabase.from('Perfil').select('*').eq('usuario_id', userId).single();
        if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });

        res.json(data || { usuario_id: userId, telefono: '', ciudad: '', pais: '' });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil.' });
    }
});

app.post('/perfil', async (req, res) => {
    try {
        const { usuario_id, telefono, ciudad, pais } = req.body;
        if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });

        const { data: existing } = await supabase.from('Perfil').select('*').eq('usuario_id', usuario_id).single();
        if (existing) {
            const { data, error } = await supabase.from('Perfil').update({ telefono, ciudad, pais, updated_at: new Date().toISOString() }).eq('usuario_id', usuario_id).select('*');
            if (error) return res.status(400).json({ error: error.message });
            return res.json(data[0]);
        }

        const { data, error } = await supabase.from('Perfil').insert([{ usuario_id, telefono, ciudad, pais }]).select('*');
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar perfil.' });
    }
});

app.get('/comunidad-chats', async (req, res) => {
    try {
        const userId = Number(req.query.userId);
        if (!userId) return res.status(400).json({ error: 'userId es requerido.' });
        const { data, error } = await supabase.from('Chat').select('*').eq('usuario_id', userId).order('created_at', { ascending: true });
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar chats.' });
    }
});

app.post('/comunidad-chats', async (req, res) => {
    try {
        const { usuario_id, chat_name, message, sender } = req.body;
        if (!usuario_id || !chat_name || !message || !sender) {
            return res.status(400).json({ error: 'usuario_id, chat_name, message y sender son requeridos.' });
        }
        const { data, error } = await supabase.from('Chat').insert([{ usuario_id, chat_name, message, sender, created_at: new Date().toISOString() }]).select('*');
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear chat.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});