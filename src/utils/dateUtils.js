// src/utils/dateUtils.js
export const getLocalDateString = (date = new Date()) => {
  const tzoffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzoffset).toISOString().split('T')[0];
};
