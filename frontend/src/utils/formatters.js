export const formatProbability = (prob) => {
  if (prob === undefined || prob === null) return '0.0%';
  return `${(prob * 100).toFixed(1)}%`;
};

export const formatDays = (days) => {
  if (days === undefined || days === null) return '--';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

export const formatNumber = (num, decimals = 1) => {
  if (num === undefined || num === null || isNaN(num)) return '--';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

export const formatSport = (sport) => {
  if (!sport) return '';
  return sport.charAt(0).toUpperCase() + sport.slice(1);
};

export const formatMinutesToHours = (minutes) => {
  if (!minutes && minutes !== 0) return '--';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};
