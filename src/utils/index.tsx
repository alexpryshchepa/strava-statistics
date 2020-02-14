export const getTimestampInSecs = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

export const isValidDate = (date: Date): boolean =>
  date instanceof Date && !isNaN(date.getTime());

export const isDateInRange = (date: Date, range: [Date, Date]): boolean =>
  date.getTime() >= range[0].getTime() && date.getTime() <= range[1].getTime();

export const resetDateTime = (date: Date) =>
  new Date(date.setHours(0, 0, 0, 0));
