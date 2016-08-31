// eslint-disable-next-line import/prefer-default-export
export function pgTimeToDate(time) {
  return new Date(`2000-01-01 ${time}`);
}
