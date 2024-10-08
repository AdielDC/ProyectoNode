import express from "express";
import fs from "fs";
import sequelize from './database.js';
import User from './user.js'; 
import Craft from './crafts.js';

const app = express();
const PORT = 3000;

app.use(express.json()); // Usa express.json() directamente

const readData = () => {
    try {
        const data = fs.readFileSync('./db.json', 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        return null;
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync("./db.json", JSON.stringify(data, null, 2)); // Formato legible
    } catch (error) {
        console.log('Error al escribir en el archivo:', error);
    }
};

// Sincronizar modelos con la base de datos
sequelize.sync()
    .then(() => {
        console.log('Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch(err => console.error('Error al sincronizar la base de datos:', err));


// Ruta principal
app.get('/', (req, res) => {
    res.send('Ruta principal: método GET');
});

// Rutas para Artesanías
app.get('/api/crafts', async (req, res) => {
    try {
        const crafts = await Craft.findAll();
        res.json(crafts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener artesanías' });
    }
});

app.post('/api/crafts', async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const newCraft = await Craft.create({ title, description, price });
        res.status(201).json(newCraft);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear artesanía' });
    }
});

app.get('/api/crafts/:id', async (req, res) => {
    try {
        const craft = await Craft.findByPk(req.params.id);
        if (!craft) return res.status(404).json({ error: 'Artesanía no encontrada' });
        res.json(craft);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener artesanía' });
    }
});

app.put('/api/crafts/:id', async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const craft = await Craft.findByPk(req.params.id);
        
        if (!craft) return res.status(404).json({ error: 'Artesanía no encontrada' });

        craft.title = title;
        craft.description = description;
        craft.price = price;
        
        await craft.save();
        
        res.json(craft);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar artesanía' });
    }
});

app.delete('/api/crafts/:id', async (req, res) => {
    try {
        const craft = await Craft.findByPk(req.params.id);
        
        if (!craft) return res.status(404).json({ error: 'Artesanía no encontrada' });

        await craft.destroy();
        
        res.json({ message: 'Artesanía eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar artesanía' });
    }
});

// Rutas para Usuarios
app.post('/api/users/register', (req, res) => {
    res.send('Registrar un nuevo usuario');
});
//prueba
app.get("/users", (req, res) => {
    const data = readData();
    
    if (!data || !data.users) { // Verifica si los datos son válidos
        return res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }

    res.json(data.users); // Devuelve la lista de usuarios
});

// Ruta para agregar un nuevo usuario
app.post("/users", (req, res) => {
    const data = readData();
    
    if (!data || !data.users) {
        return res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }

    const newUser = {
        id: data.users.length ? data.users[data.users.length - 1].id + 1 : 1, // Genera un nuevo ID
        nombre: req.body.nombre,
        telefono: req.body.telefono
    };

    data.users.push(newUser);
    writeData(data);

    res.status(201).json(newUser); // Devuelve el nuevo usuario creado
});

// Ruta para modificar un usuario existente
app.put("/users/:id", (req, res) => {
    const data = readData();

    if (!data || !data.users) {
        return res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }

    const userId = parseInt(req.params.id);
    const userIndex = data.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Modifica el usuario
    data.users[userIndex].nombre = req.body.nombre;
    data.users[userIndex].telefono = req.body.telefono;

    writeData(data);

    res.json(data.users[userIndex]); // Devuelve el usuario actualizado
});

// Ruta para eliminar un usuario
app.delete("/users/:id", (req, res) => {
    const data = readData();

    if (!data || !data.users) {
        return res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }

    const userId = parseInt(req.params.id);
    const userIndex = data.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Elimina el usuario
    const deletedUser = data.users.splice(userIndex, 1);

    writeData(data);

    res.json(deletedUser[0]); // Devuelve el usuario eliminado
});


//fin prueba
app.post('/api/users/login', (req, res) => {
    res.send('Iniciar sesión de un usuario');
});

app.get('/api/users/profile', (req, res) => {
    res.send('Obtener perfil del usuario');
});

app.put('/api/users/profile', (req, res) => {
    res.send('Actualizar perfil del usuario');
});

app.delete('/api/users/profile', (req, res) => {
    res.send('Eliminar perfil del usuario');
});

// Rutas para Categorías de Artesanías
app.get('/api/categories', (req, res) => {
    res.send('Listar todas las categorías');
});

app.post('/api/categories', (req, res) => {
    res.send('Crear una nueva categoría');
});

app.get('/api/categories/:id', (req, res) => {
    res.send(`Obtener detalles de la categoría con ID: ${req.params.id}`);
});

app.put('/api/categories/:id', (req, res) => {
    res.send(`Editar la categoría con ID: ${req.params.id}`);
});

app.delete('/api/categories/:id', (req, res) => {
    res.send(`Eliminar la categoría con ID: ${req.params.id}`);
});

// Rutas para reservaciones o pedidos
app.post('/api/reservations', (req, res) => {
    res.send('Hacer una reservacion');
});
app.get('/api/reservations/:id', (req, res) => {
    res.send('Listar todas las reservaciones con id');
});
app.put('/api/reservations/:id', (req, res) => {
    res.send('editar las reservaciones con id');
});
app.delete('/api/reservations/:id', (req, res) => {
    res.send('eliminar una reservacion con id');
});

//Rutas para pagos
app.post('/api/payments/checkout', (req, res) => {
    res.send('Procesar un pago');
});
app.get('/api/payments/history', (req, res) => {
    res.send('Checar el historial de pagos');
});

//Rutas a notificaciones
app.get('/api/notifications', (req, res) => {
    res.send('Obtener todas las notificaciones a usuarios');
});

app.post('/api/reservations/send', (req, res) => {
    res.send('Enviar notificacion a un usuario especifico');
});



//base de datos
/*const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/proyecto', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('No se pudo conectar a MongoDB', err)); */