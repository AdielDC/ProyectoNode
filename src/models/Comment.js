// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    craftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Craft' }, // Referencia a la artesanía comentada
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referencia al usuario que dejó el comentario
    commentText: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 }, // Puntuación dada por el usuario (1 a 5)
    createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;