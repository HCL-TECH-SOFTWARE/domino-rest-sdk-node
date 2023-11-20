export const isEmpty = (value: any) => {
  if (typeof value === 'string') {
    return value === undefined || value === null || value.trim().length === 0;
  } else if (typeof value === 'object') {
    return value === undefined || value === null || Object.keys(value).length === 0;
  } else if (Array.isArray(value)) {
    return value === undefined || value === null || value.length === 0;
  }
  return value === undefined || value === null;
};
