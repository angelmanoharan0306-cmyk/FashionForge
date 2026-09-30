/**
 * FashionForge — Order Mongoose Model
 * Represents an authenticated placed/pending bespoke couture order.
 */

const mongoose = require('mongoose');

/**
 * Generates unique collision-safe Order ID
 * Format: FF-ORD-[TIMESTAMP_BASE36]-[RANDOM_HEX4]
 */
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FF-ORD-${timestamp}-${randomPart}`;
}

const orderItemSchema = new mongoose.Schema(
  {
    designId: {
      type: String,
      required: true,
      trim: true
    },
    designName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    configuration: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true
    },
    shippingAddress: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generateOrderId
    },
    userId: {
      type: String,
      required: [true, 'User ID is required for order'],
      index: true,
      trim: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [items => items.length > 0, 'Order must contain at least one item']
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    customer: {
      type: customerSchema,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'processing', 'completed', 'cancelled'],
      default: 'placed',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.orderId;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
