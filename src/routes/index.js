const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/proyecto', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('No se pudo conectar a MongoDB', err));

// Importar Rutas
const userRoutes = require('./routes/userRoutes');
const craftRoutes = require('./routes/craftRoutes');
// Importa otras rutas según sea necesario

// Usar Rutas
app.use('/api/users', userRoutes);
app.use('/api/crafts', craftRoutes);
// Usa otras rutas según sea necesario

// Ruta principal
app.get('/', (req, res) => {
    res.send('Ruta principal: método GET');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});