/**
 * FashionForge — Cart Mongoose Model
 * Represents an authenticated user's shopping atelier bag.
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    cartItemId: {
      type: String,
      required: true,
      default: () => `citem_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
    },
    designId: {
      type: String,
      required: [true, 'Design ID is required for cart item'],
      trim: true
    },
    designName: {
      type: String,
      required: [true, 'Design name is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    configuration: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Design configuration snapshot is required']
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required for cart'],
      unique: true,
      index: true,
      trim: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        let subtotal = 0;
        let count = 0;
        (ret.items || []).forEach(item => {
          item.totalPrice = (item.quantity || 1) * (item.unitPrice || 0);
          subtotal += item.totalPrice;
          count += (item.quantity || 1);
        });
        ret.subtotal = subtotal;
        ret.total = subtotal;
        ret.totalItems = count;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Method to recalculate line item total prices and validate
cartSchema.methods.recalculate = function () {
  this.items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
  });
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
