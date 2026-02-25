/**
 * @file config/constants.js
 * @description Application-wide enumerations for split types and statuses.
 */

/** Supported split calculation strategies. */
export const SPLIT_TYPE = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  CUSTOM: 'custom',
  ITEM_BASED: 'item_based',
};

/** Lifecycle statuses a split can move through. */
export const SPLIT_STATUS = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
  FINALIZED: 'finalized',
  CANCELLED: 'cancelled',
};
