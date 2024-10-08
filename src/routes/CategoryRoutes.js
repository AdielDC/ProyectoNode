const express = require('express');
const router = express.Router();

// Rutas para Categorías de Artesanías
router.get('/api/categories', (req, res) => {
    res.send('Listar todas las categorías');
});

router.post('/api/categories', (req, res) => {
    res.send('Crear una nueva categoría');
});

router.get('/api/categories/:id', (req, res) => {
    res.send(`Obtener detalles de la categoría con ID: ${req.params.id}`);
});

router.put('/api/categories/:id', (req, res) => {
    res.send(`Editar la categoría con ID: ${req.params.id}`);
});

router.delete('/api/categories/:id', (req, res) => {
    res.send(`Eliminar la categoría con ID: ${req.params.id}`);
});

module.exports = router;