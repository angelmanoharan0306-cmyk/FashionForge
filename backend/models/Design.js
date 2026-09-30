/**
 * FashionForge — Design Mongoose Model
 * Schema representing bespoke fashion configurations matching Phase 7/8 specifications.
 */

const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    designId: {
      type: String,
      required: [true, 'Design ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    userId: {
      type: String,
      index: true,
      trim: true,
      default: null
    },
    name: {
      type: String,
      required: [true, 'Design name is required'],
      trim: true,
      maxlength: [120, 'Design name cannot exceed 120 characters']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['female', 'male'],
        message: 'Gender must be either "female" or "male"'
      },
      default: 'female'
    },
    figure: {
      type: String,
      enum: ['female', 'male'],
      default: 'female'
    },
    croquis: {
      type: String,
      enum: ['female', 'male'],
      default: 'female'
    },
    size: {
      type: String,
      required: [true, 'Garment size is required'],
      default: 'M',
      trim: true
    },
    top: {
      type: String,
      required: [true, 'Top component is required'],
      trim: true
    },
    bottom: {
      type: String,
      required: [true, 'Bottom component is required'],
      trim: true
    },
    sleeves: {
      type: String,
      default: 'none',
      trim: true
    },
    collar: {
      type: String,
      default: 'crew',
      trim: true
    },
    neckline: {
      type: String,
      default: 'crew',
      trim: true
    },
    fabric: {
      type: String,
      required: [true, 'Fabric selection is required'],
      trim: true
    },
    colour: {
      type: String,
      required: [true, 'Colour code is required'],
      trim: true
    },
    pattern: {
      type: String,
      default: 'solid',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative']
    },
    styleId: {
      type: String,
      default: '',
      trim: true
    },
    view: {
      type: String,
      enum: ['front', 'back'],
      default: 'front'
    },
    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.designId;
        ret.collar = ret.collar || ret.neckline || 'crew';
        ret.neckline = ret.neckline || ret.collar || 'crew';
        ret.figure = ret.figure || ret.gender || 'female';
        ret.gender = ret.gender || ret.figure || 'female';
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save hook to ensure consistency between aliases and configuration snapshot
designSchema.pre('save', function () {
  if (!this.figure) this.figure = this.gender;
  if (!this.gender) this.gender = this.figure;
  if (!this.neckline) this.neckline = this.collar;
  if (!this.collar) this.collar = this.neckline;
  if (!this.croquis) this.croquis = this.figure;
  if (!this.styleId) this.styleId = this.designId;

  // Ensure full configuration snapshot is present
  if (!this.configuration || Object.keys(this.configuration).length === 0) {
    this.configuration = {
      gender: this.gender,
      figure: this.figure,
      croquis: this.croquis,
      size: this.size,
      top: this.top,
      bottom: this.bottom,
      sleeves: this.sleeves,
      collar: this.collar,
      neckline: this.neckline,
      fabric: this.fabric,
      colour: this.colour,
      pattern: this.pattern,
      notes: this.notes,
      price: this.price,
      view: this.view
    };
  }
});

const Design = mongoose.model('Design', designSchema);

module.exports = Design;
