// Calculate the average of all the numbers
const calculateMean = (values: Array<number>): number => {
  const mean = values.reduce((sum, current) => sum + current) / values.length;
  return mean;
};

// Calculate variance
const calculateVariance = (values: Array<number>): number => {
  const average = calculateMean(values);
  const squareDiffs = values.map((value) => {
    const diff = value - average;
    return diff * diff;
  });
  const variance = calculateMean(squareDiffs);
  return variance;
};

// Calculate stand deviation
const calculateSD = (variance: number): number => {
  return Math.sqrt(variance);
};

export { calculateMean, calculateVariance, calculateSD };
