const express = require('express');
const router = express.Router();

// Rutas para Usuarios
router.post('/register', (req, res) => {
    res.send('Registrar un nuevo usuario');
});

router.post('/login', (req, res) => {
    res.send('Iniciar sesión de un usuario');
});

router.get('/profile', (req, res) => {
    res.send('Obtener perfil del usuario');
});

router.put('/profile', (req, res) => {
    res.send('Actualizar perfil del usuario');
});

router.delete('/profile', (req, res) => {
    res.send('Eliminar perfil del usuario');
});

module.exports = router;