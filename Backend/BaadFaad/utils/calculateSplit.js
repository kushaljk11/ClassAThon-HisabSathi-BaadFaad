import Participant from '../models/participant.model.js';
import { SPLIT_TYPE } from '../config/constants.js';

/**
 * Calculate split amounts based on the split type.
 *
 * @param {string} splitType - One of SPLIT_TYPE values
 * @param {Object} receipt - Receipt document with items and totalAmount
 * @param {Array} breakdown - Incoming breakdown hints (percentages, custom amounts, item assignments)
 * @param {string} sessionId - The session ObjectId
 * @returns {Array} Calculated breakdown array ready to be saved on the Split document
 */
export const calculateSplit = async (splitType, receipt, breakdown = [], sessionId) => {
  const participants = await Participant.find({ session: sessionId });

  if (!participants.length) {
    throw new Error('No participants found for this session');
  }

  switch (splitType) {
    case SPLIT_TYPE.EQUAL: {
      const perPerson = Math.round((receipt.totalAmount / participants.length) * 100) / 100;
      return participants.map((p) => ({
        participant: p._id,
        user: p._id, // same as participant when there's no User model link
        amount: perPerson,
        percentage: Math.round((100 / participants.length) * 100) / 100,
        items: [],
      }));
    }

    case SPLIT_TYPE.PERCENTAGE: {
      // breakdown should contain { participantId, percentage }
      return breakdown.map((entry) => ({
        participant: entry.participantId,
        user: entry.participantId,
        amount: Math.round((receipt.totalAmount * entry.percentage) / 100 * 100) / 100,
        percentage: entry.percentage,
        items: [],
      }));
    }

    case SPLIT_TYPE.CUSTOM: {
      // breakdown should contain { participantId, amount }
      return breakdown.map((entry) => ({
        participant: entry.participantId,
        user: entry.participantId,
        amount: entry.amount,
        percentage: Math.round((entry.amount / receipt.totalAmount) * 100 * 100) / 100,
        items: [],
      }));
    }

    case SPLIT_TYPE.ITEM_BASED: {
      // breakdown should contain { participantId, items: [{ itemName, itemPrice, quantity }] }
      return breakdown.map((entry) => {
        const totalForPerson = entry.items.reduce(
          (sum, item) => sum + item.itemPrice * (item.quantity || 1),
          0
        );
        return {
          participant: entry.participantId,
          user: entry.participantId,
          amount: totalForPerson,
          percentage: Math.round((totalForPerson / receipt.totalAmount) * 100 * 100) / 100,
          items: entry.items,
        };
      });
    }

    default:
      throw new Error(`Unknown split type: ${splitType}`);
  }
};
