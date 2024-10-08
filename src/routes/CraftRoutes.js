const express = require('express');
const router = express.Router();

// Rutas para Artesanías
router.get('/', (req, res) => {
    res.send('Listar todas las artesanías');
});

router.post('/', (req, res) => {
    res.send('Crear una nueva artesanía');
});

router.get('/:id', (req, res) => {
    res.send(`Obtener detalles de la artesanía con ID: ${req.params.id}`);
});

router.put('/:id', (req, res) => {
    res.send(`Editar la artesanía con ID: ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
    res.send(`Eliminar la artesanía con ID: ${req.params.id}`);
});

module.exports = router;