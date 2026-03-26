const MERCHANT_OVERRIDES = {
  'uid_12345_abc': {
    discountLock: true,
    maxDiscount: 20,
    allowAllYearDiscount: true,
  },
  'uid_67890_xyz': {
    discountLock: true,
    maxDiscount: 15,
    allowAllYearDiscount: false,
  },
};

export function getMerchantOverride(uid) {
  return MERCHANT_OVERRIDES[uid] ?? null;
}
