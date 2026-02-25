/**
 * Minimize transactions using graph algorithm
 * This reduces the number of transactions needed to settle all debts
 */
export const minimizeTransactions = (participants) => {
  // Calculate net balance for each participant
  const balances = {};

  participants.forEach((p) => {
    const netBalance = p.totalPaid - p.totalOwed;
    if (netBalance !== 0) {
      balances[p.user._id.toString()] = {
        userId: p.user._id,
        balance: netBalance,
      };
    }
  });

  const transactions = [];
  const creditors = []; // People who are owed money (positive balance)
  const debtors = []; // People who owe money (negative balance)

  // Separate creditors and debtors
  Object.values(balances).forEach((item) => {
    if (item.balance > 0) {
      creditors.push(item);
    } else if (item.balance < 0) {
      debtors.push(item);
    }
  });

  // Match debtors with creditors
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const debtAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;

    const settlementAmount = Math.min(debtAmount, creditAmount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(settlementAmount.toFixed(2)),
    });

    debtor.balance += settlementAmount;
    creditor.balance -= settlementAmount;

    if (Math.abs(debtor.balance) < 0.01) {
      i++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      j++;
    }
  }

  return transactions;
};
