function calculateMartingaleSafeValues(balance, maxLosses) {
  const base = Math.floor(balance / (2 ** maxLosses - 1) / 4.5);
  const limit = base * (2 ** maxLosses);
  return { start: base, limit };
}

// Example:
console.log(calculateMartingaleSafeValues(16000 , 6)); 
