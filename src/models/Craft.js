// models/Craft.js
const mongoose = require('mongoose');

const craftSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Referencia a la categoría
    images: [{ type: String }], // URLs de las imágenes
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Craft = mongoose.model('Craft', craftSchema);
module.exports = Craft;