export const ROLES = {
  HOST: 'host',
  PARTICIPANT: 'participant',
  ADMIN: 'admin'
};

export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PARTICIPANT_STATUS = {
  PENDING: 'pending',
  JOINED: 'joined',
  DECLINED: 'declined'
};

export const SPLIT_TYPE = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  CUSTOM: 'custom',
  ITEM_WISE: 'itemWise'
};

export const SPLIT_STATUS = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
  FINALIZED: 'finalized'
};

export const SETTLEMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  VERIFIED: 'verified',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const PAYMENT_METHOD = {
  CASH: 'cash',
  ONLINE: 'online',
  UPI: 'upi',
  BANK_TRANSFER: 'bankTransfer'
};

export const NUDGE_TYPE = {
  REMINDER: 'reminder',
  URGENT: 'urgent',
  FINAL: 'final'
};
