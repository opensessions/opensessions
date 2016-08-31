import moment from 'moment';

export function pgTimeToDate(time) {
  return new Date(`2000-01-01 ${time}`);
}
