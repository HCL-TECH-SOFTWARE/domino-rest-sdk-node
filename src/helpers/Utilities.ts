/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

export const isEmpty = (value: any): boolean => {
  if (value === undefined || value === null) {
    return true;
  }

  return (
    (typeof value === 'string' && value.trim().length === 0) ||
    (Array.isArray(value) && value.filter((x) => !isEmpty(x)).length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};
