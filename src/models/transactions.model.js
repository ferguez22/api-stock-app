const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    type: {
        type: String,
        enum: ['OUT', 'IN'], // OUT = salió del almacén, IN = volvió
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1']
    }
}, {
    timestamps: true,
    versionKey: false
});

const Transaction = mongoose.model('transactions', TransactionSchema);
module.exports = Transaction;
