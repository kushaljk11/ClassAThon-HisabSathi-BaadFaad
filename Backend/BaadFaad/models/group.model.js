import mongoose from 'mongoose';

/**
 * Group model represents a persistent expense-sharing group.
 * Members can join via QR and create multiple splits over time.
 */
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: [2, 'Group name must be at least 2 characters'],
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },
    qrCode: {
      type: String,
      default: '',
    },
    defaultCurrency: {
      type: String,
      enum: ['NPR', 'USD', 'INR'],
      default: 'NPR',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

groupSchema.index({ createdBy: 1, createdAt: -1 });
groupSchema.index({ isActive: 1 });
groupSchema.index({ members: 1 });

groupSchema.set('toJSON', {
  transform: (_doc, result) => {
    result.id = result._id;
    delete result._id;
    return result;
  },
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
