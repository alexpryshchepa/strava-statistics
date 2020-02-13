export const getTimestampInSecs = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

export const isValidDate = (date: Date): boolean =>
  date instanceof Date && !isNaN(date.getTime());
