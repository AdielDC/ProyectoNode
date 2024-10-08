// models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referencia al usuario que hizo la reservación
    craftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Craft' }, // Referencia a la artesanía reservada
    reservationDate: { type: Date, required: true },
    status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' }, // Estado de la reservación
    createdAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;