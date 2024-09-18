export const calculatePercentageChange = (
  initialValue: number,
  finalValue: number
) => {
  if (initialValue === 0) return 0;
  return ((finalValue - initialValue) / initialValue) * 100;
};
