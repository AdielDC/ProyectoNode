// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referencia al usuario que realizó el pago
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }, // Estado del pago
    transactionId: { type: String }, // ID del proveedor de pagos
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;