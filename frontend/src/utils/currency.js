const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export const formatINR = (amount) => inrFormatter.format(Number(amount));
