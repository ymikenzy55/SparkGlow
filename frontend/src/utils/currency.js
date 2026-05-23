/**
 * Format a number as Ghana Cedi currency with comma formatting
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string e.g. "GH₵ 1,234.56"
 */
export function formatCedi(amount) {
  if (amount == null || isNaN(amount)) return 'GH₵ 0.00'
  return 'GH₵ ' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
