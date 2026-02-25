import Participant from '../models/participant.model.js';
import { SPLIT_TYPE } from '../config/constants.js';

export const calculateSplit = async (splitType, receipt, breakdown, sessionId) => {
  const participants = await Participant.find({ session: sessionId });

  let calculatedBreakdown = [];

  switch (splitType) {
    case SPLIT_TYPE.EQUAL:
      // Split equally among all participants
      const equalAmount = receipt.totalAmount / participants.length;
      calculatedBreakdown = participants.map((p) => ({
        participant: p._id,
        user: p.user,
        amount: parseFloat(equalAmount.toFixed(2)),
      }));
      break;

    case SPLIT_TYPE.PERCENTAGE:
      // Split by percentage (provided in breakdown)
      calculatedBreakdown = breakdown.map((item) => ({
        participant: item.participant,
        user: item.user,
        amount: parseFloat(((receipt.totalAmount * item.percentage) / 100).toFixed(2)),
        percentage: item.percentage,
      }));
      break;

    case SPLIT_TYPE.CUSTOM:
      // Custom amounts (provided in breakdown)
      calculatedBreakdown = breakdown.map((item) => ({
        participant: item.participant,
        user: item.user,
        amount: parseFloat(item.amount.toFixed(2)),
      }));
      break;

    case SPLIT_TYPE.ITEM_WISE:
      // Item-wise split (provided in breakdown with items)
      calculatedBreakdown = breakdown.map((item) => {
        const itemTotal = item.items.reduce((sum, i) => sum + i.itemPrice * i.quantity, 0);
        return {
          participant: item.participant,
          user: item.user,
          amount: parseFloat(itemTotal.toFixed(2)),
          items: item.items,
        };
      });
      break;

    default:
      throw new Error('Invalid split type');
  }

  return calculatedBreakdown;
};
