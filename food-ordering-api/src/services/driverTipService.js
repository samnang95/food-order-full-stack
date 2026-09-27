const DriverTip = require('../models/driverTipModel');

const DEFAULT_DRIVER_PROFILE = {
  driverId: 'driver_001',
  name: 'Sok Dara',
  phone: '+855 12 889 900',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160',
  vehicle: 'Honda Wave 125i',
  plateNumber: 'Phnom Penh 1AC-9281',
  rating: 4.96,
  totalDeliveries: 1248,
  compliments: {
    super_fast: 420,
    careful_handling: 388,
    friendly_smile: 512,
    followed_notes: 310,
    weather_hero: 275,
  },
};

const submitDriverTip = async ({ orderId, driverId = 'driver_001', amount, paymentMethod, compliments = [], note = '', rating = 5 }) => {
  const amountUsd = Number(amount || 0);
  const amountKhr = Math.round(amountUsd * 4100);

  const tip = new DriverTip({
    orderId,
    driverId,
    driverName: DEFAULT_DRIVER_PROFILE.name,
    amountUsd,
    amountKhr,
    paymentMethod: paymentMethod || 'checkout_add_on',
    compliments,
    note,
    rating,
    status: 'completed',
    bakongRef: paymentMethod === 'bakong_khqr' ? `KHQR_${Date.now()}` : null,
  });

  await tip.save();
  return tip;
};

const getOrderTipStatus = async (orderId) => {
  const tips = await DriverTip.find({ orderId });
  const hasTipped = tips.length > 0;
  const totalTippedUsd = tips.reduce((acc, t) => acc + (t.amountUsd || 0), 0);

  return {
    hasTipped,
    totalTippedUsd,
    tips,
  };
};

const submitDriverFeedback = async ({ orderId, rating, compliments = [], reviewText = '', tipAmount = 0 }) => {
  let tipRecord = await DriverTip.findOne({ orderId });

  if (tipRecord) {
    tipRecord.rating = rating || tipRecord.rating;
    tipRecord.compliments = [...new Set([...tipRecord.compliments, ...(compliments || [])])];
    tipRecord.note = reviewText || tipRecord.note;
    if (tipAmount > 0) {
      tipRecord.amountUsd = Number(tipAmount);
      tipRecord.amountKhr = Math.round(Number(tipAmount) * 4100);
    }
    await tipRecord.save();
  } else {
    tipRecord = await submitDriverTip({
      orderId,
      amount: tipAmount,
      compliments,
      note: reviewText,
      rating,
      paymentMethod: 'checkout_add_on',
    });
  }

  return {
    success: true,
    message: 'Feedback submitted successfully',
    feedback: tipRecord,
  };
};

const getDriverProfile = async (driverId = 'driver_001') => {
  // Aggregate live compliments from DB
  const recentTips = await DriverTip.find({ driverId }).limit(100);

  const profile = { ...DEFAULT_DRIVER_PROFILE };
  recentTips.forEach((t) => {
    (t.compliments || []).forEach((c) => {
      if (profile.compliments[c] !== undefined) {
        profile.compliments[c] += 1;
      }
    });
  });

  return profile;
};

module.exports = {
  submitDriverTip,
  getOrderTipStatus,
  submitDriverFeedback,
  getDriverProfile,
};
