const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Product type is required'],
        trim: true
    },
    item: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    code: {
        type: String,
        unique: true,
        immutable: true, // <<--- Evita que se pueda modificar después
        default: undefined

    }
},
    {
    timestamps: true,
    versionKey: false
});

// Hook para generar el código automáticamente
ProductSchema.pre('save', async function(next) {
    if (this.isNew && !this.code) {
        if (!this.type || !this.item) {
            return next(new Error('Product type and item are required to generate code'));
        }

        const maxAttempts = 5;
        let attempt = 0;
        let newCode;

        do {
            const typePart = this.type.substring(0, 3).toUpperCase().padEnd(3, 'X');
            const itemPart = this.item.substring(0, 3).toUpperCase().padEnd(3, 'X');
            const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            newCode = `${typePart}${itemPart}${randomPart}`;

            const existing = await this.constructor.findOne({ code: newCode });
            if (!existing) break;
            attempt++;
        } while (attempt < maxAttempts);

        if (attempt === maxAttempts) {
            return next(new Error('Unable to generate a unique product code'));
        }

        this.code = newCode;
    }

    if (!this.code) {
        return next(new Error('No se pudo generar el código del producto'));
    }

    next();
});


const Product = mongoose.model('products', ProductSchema);
module.exports = Product;
