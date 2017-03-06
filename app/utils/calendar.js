import moment from 'moment';

import { getDuration } from '../../utils/calendar';
export { calendarLinks, parseSchedule } from '../../utils/calendar';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function parseSlot(slot) {
  const date = new Date(slot.start);
  const end = new Date(slot.end);
  const now = new Date();
  return {
    date: moment(date).format(date.getFullYear() === now.getFullYear() ? 'dddd D MMM' : 'dddd D MMM YYYY'),
    time: date.toTimeString().slice(0, 5),
    duration: getDuration(date, end)
  };
}

export function formatTime(date) {
  return `${date.toDateString()} (${date.toTimeString().substr(0, 5)})`;
}

export function intervalsAgo(date, interval) {
  return Math.floor((Date.now() - date.getTime()) / (MS_PER_DAY * interval));
}

const periods = [
  { type: 'm', sum: 4 },
  { type: 'w', sum: 7 },
  { type: 'd', sum: 24 },
  { type: 'h', sum: 1 }
];
const periodSums = periods.map(period => period.sum);
const periodRanges = periodSums.map((sum, i) => periodSums.slice(i).reduce((sum1, sum2) => sum1 * sum2));

export function cleanDate(date) {
  const period = Math.abs((date.getTime() - Date.now()) / (1000 * 60 * 60));
  const [dM, dW, dD, dH] = periodRanges.map((delta, key) => (period % (key ? periodRanges[key - 1] : 10000)) / delta).map(Math.floor);
  return [[dM, 'm'], [dW, 'w'], [dD, 'd'], [dH, 'h']].filter(([diff]) => diff).map(pair => pair.join('')).join(' ');
}

export function timeAgo(date) {
  const clean = cleanDate(new Date(date));
  return clean ? `${clean} ago` : 'just now';
}

export function weeksAgo(date) {
  return intervalsAgo(date, 7);
}

export function lastUpdatedString(session) {
  const today = new Date();
  const updated = new Date(session.updatedAt);
  let updatedAt = '';
  let freshness = 2;
  const dayDelta = [today, updated].map(time => Math.floor(time.getTime() / MS_PER_DAY)).reduce((todayDay, updatedDay) => todayDay - updatedDay);
  if (dayDelta === 0) {
    updatedAt = 'today';
  } else if (dayDelta < 7) {
    updatedAt = `${dayDelta} days ago`;
  } else if (dayDelta < 31) {
    updatedAt = `${Math.floor(dayDelta / 7)} week${dayDelta < 14 ? '' : 's'} ago`;
  } else if (dayDelta < 92) {
    updatedAt = 'over a month ago';
    freshness = 1;
  } else {
    updatedAt = 'over three months ago';
    freshness = 0;
  }
  return [updatedAt, dayDelta, freshness];
}
