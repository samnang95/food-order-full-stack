const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    time: { type: String, required: true },
    completed: { type: Boolean, default: false },
    current: { type: Boolean, default: false },
  },
  { _id: false }
);

const driverInfoSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Sok Dara' },
    phone: { type: String, default: '+855 12 889 900' },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    },
    vehicleType: { type: String, default: 'Honda Wave 125i' },
    vehiclePlate: { type: String, default: 'PP-1BC-8899' },
    rating: { type: Number, default: 4.9 },
  },
  { _id: false }
);

const deliveryTrackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'driver_assigned',
        'picked_up',
        'out_for_delivery',
        'arriving',
        'delivered',
        'cancelled',
      ],
      default: 'out_for_delivery',
      index: true,
    },
    stepIndex: {
      type: Number,
      default: 5, // out_for_delivery
    },
    estimatedMinutes: {
      type: Number,
      default: 14,
    },
    distanceKm: {
      type: Number,
      default: 2.4,
    },
    driver: {
      type: driverInfoSchema,
      default: () => ({}),
    },
    driverLocation: {
      type: locationSchema,
      default: () => ({ lat: 11.5540, lng: 104.9265 }),
    },
    restaurantLocation: {
      type: locationSchema,
      default: () => ({ lat: 11.5564, lng: 104.9282 }),
    },
    deliveryLocation: {
      type: locationSchema,
      default: () => ({ lat: 11.5510, lng: 104.9250 }),
    },
    timeline: [timelineEventSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);
