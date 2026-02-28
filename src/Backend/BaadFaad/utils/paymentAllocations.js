/**
 * Utilities for computing payment allocations and deriving per-participant
 * paid amounts from split.payments -> allocations.
 */

export function aggregateAllocationsByKey(split) {
  const payments = (split && split.payments) || [];
  const sums = {}; // key -> total amount
  const payers = {}; // key -> array of payer names (first kept)
  // Build a map from breakdown entry id -> canonical user id (if present).
  // This helps when historical allocations reference a breakdown._id instead
  // of the user's id, which would otherwise miss matches after recalculation.
  const breakdownIdToUserId = {};
  (split && Array.isArray(split.breakdown) ? split.breakdown : []).forEach((b) => {
    const bdId = b && (b._id || b.id);
    const userId = b && (b.user && (b.user._id || b.user)) || null;
    if (bdId && userId) breakdownIdToUserId[String(bdId)] = String(userId);
  });

  payments.forEach((p) => {
    const payerName = (p.paidBy && (p.paidBy.name || p.paidBy.email)) || '';
    (p.allocations || []).forEach((a) => {
      // Normalize allocation target key. `a.paidFor` may be an ObjectId, a
      // breakdown entry id, or plain string; handle object-with-_id and plain
      // string values. If the key matches a known breakdown id, map it to the
      // canonical user id so sums align with current breakdown entries.
      let rawKey = (a.paidFor && (a.paidFor._id || a.paidFor)) || a.paidForName || a.paidForEmail || '';
      rawKey = rawKey || '';
      let key = String(rawKey);

      // If this rawKey references a breakdown entry id that maps to a user id,
      // use the user id as the aggregation key instead.
      if (breakdownIdToUserId[key]) {
        key = breakdownIdToUserId[key];
      } else {
        // If not, try to resolve by paidForName / paidForEmail to handle
        // historical allocations that recorded display names or emails.
        const nameLookup = (a.paidForName || '').toString().toLowerCase();
        const emailLookup = (a.paidForEmail || '').toString().toLowerCase();
        if (nameLookup || emailLookup) {
          for (const bd of (split.breakdown || [])) {
            const bdName = (bd.name || '').toString().toLowerCase();
            const bdEmail = (bd.email || '').toString().toLowerCase();
            if (nameLookup && bdName && nameLookup === bdName) {
              key = (bd.user && (bd.user._id || bd.user)) || (bd.participant && (bd.participant._id || bd.participant)) || String(bd._id || '');
              break;
            }
            if (emailLookup && bdEmail && emailLookup === bdEmail) {
              key = (bd.user && (bd.user._id || bd.user)) || (bd.participant && (bd.participant._id || bd.participant)) || String(bd._id || '');
              break;
            }
          }
        }
      }

      const amt = Number(a.amount || 0);
      sums[key] = (sums[key] || 0) + amt;
      if (!payers[key]) payers[key] = [];
      if (payerName && payers[key].indexOf(payerName) === -1) payers[key].push(payerName);
    });
  });

  return { sums, payers };
}

/**
 * Given a split object (may be lean), return a copy of breakdown where each
 * entry includes `amountPaid` (sum of allocations that target that entry)
 * and `paidByName` (first payer found for that entry) for compatibility.
 */
export function breakdownWithAllocations(split) {
  const breakdown = Array.isArray(split.breakdown) ? split.breakdown : [];
  const { sums, payers } = aggregateAllocationsByKey(split);

  return breakdown.map((b) => {
    const copy = Object.assign({}, b);
    // candidate keys to match allocations: user id, name, email
    const idKey = String((b.user && (b.user._id || b.user)) || (b.participant && (b.participant._id || b.participant)) || b._id || '');
    const nameKey = String(b.name || '').toLowerCase();
    const emailKey = String(b.email || '').toLowerCase();

    let amountPaid = 0;
    let paidByName = '';

    // match by id first
    if (idKey && sums[idKey]) {
      amountPaid += Number(sums[idKey] || 0);
      paidByName = (payers[idKey] || [])[0] || '';
    }

    // then match by email
    if (emailKey && sums[emailKey]) {
      amountPaid += Number(sums[emailKey] || 0);
      if (!paidByName) paidByName = (payers[emailKey] || [])[0] || '';
    }

    // then match by name
    if (nameKey && sums[nameKey]) {
      amountPaid += Number(sums[nameKey] || 0);
      if (!paidByName) paidByName = (payers[nameKey] || [])[0] || '';
    }

    // Use allocation-derived sums as the source of truth for `amountPaid`.
    // Legacy `b.amountPaid` values are no longer authoritative and can cause
    // divergences when historical payments exist. We still round to cents.
    copy.amountPaid = Math.round(((amountPaid || 0) + Number.EPSILON) * 100) / 100;
    copy.paidByName = copy.paidByName || paidByName || '';
    // preserve paidById/email from breakdown if present (used by frontend selectors)
    copy.paidById = copy.paidById || (b.paidBy && (b.paidBy.id || b.paidBy._id)) || '';
    copy.paidByEmail = copy.paidByEmail || (b.paidBy && b.paidBy.email) || '';
    // also retain paidForId so clients can compute flow links
    copy.paidForId = b.paidForId || '';
    return copy;
  });
}

export default {
  aggregateAllocationsByKey,
  breakdownWithAllocations,
};
