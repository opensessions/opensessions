import moment from 'moment';

import { pgTimeToDate } from './postgres';

export function parseSlot(slot) {
  const date = new Date(slot.start);
  const now = new Date();
  const dur = moment.duration(moment(slot.end).diff(moment(slot.start)));
  const hours = (dur.asHours() + 24) % 24;
  const hoursInt = Math.floor(hours);
  const minsInt = Math.ceil((hours % 1) * 60);
  return {
    date: moment(date).format(date.getFullYear() === now.getFullYear() ? 'dddd D MMM' : 'dddd D MMM YYYY'),
    time: date.toTimeString().slice(0, 5),
    duration: [hoursInt ? `${hoursInt}h` : '', minsInt ? ` ${minsInt}m` : ''].join('')
  };
}

export function parseSchedule(instance) {
  const { startDate, startTime, endTime } = instance;
  const data = {};
  const now = new Date();
  if (startDate) {
    const date = new Date(startTime ? [startDate, startTime].join('T') : startDate);
    data.date = moment(date).format(date.getFullYear() === now.getFullYear() ? 'dddd D MMM' : 'dddd D MMM YYYY');
    data.hasOccurred = date.getTime() <= now.getTime();
  }
  if (startTime) {
    data.time = startTime.slice(0, 5);
    if (endTime) {
      const dur = moment.duration(moment(pgTimeToDate(endTime)).diff(moment(pgTimeToDate(startTime))));
      const hours = (dur.asHours() + 24) % 24;
      const hoursInt = Math.floor(hours);
      const minsInt = Math.ceil((hours % 1) * 60);
      data.duration = [hoursInt ? `${hoursInt}h` : '', minsInt ? ` ${minsInt}m` : ''].join('');
    }
  }
  return data;
}

export function calendarLinks(schedule, title, description, location) {
  const { startDate, startTime, endTime } = schedule;
  const dates = [startTime, endTime].map(time => [startDate, time].join('T').replace(/-|:|\.\d\d\d/g, ''));
  return {
    googleCalendar: `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates.join('/')}&details=${description}&location=${location}&sprop=&sprop=name:`
  };
}

export function sortSchedule(schedules) {
  if (!(schedules && schedules.length)) return [];
  return schedules.map(slot => ({
    start: new Date([slot.startDate, slot.startTime].join('T')),
    end: new Date([slot.startDate, slot.endTime].join('T')),
    ...slot
  })).sort((a, b) => a.start - b.start);
}

export function nextSchedule(schedules) {
  return sortSchedule(schedules).find(schedule => schedule.start > Date.now());
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function formatTime(date) {
  return `${date.toDateString()} (${date.toTimeString().substr(0, 5)})`;
}

export function intervalsAgo(date, interval) {
  return Math.floor((Date.now() - date.getTime()) / (MS_PER_DAY * interval));
}

export function cleanDate(date) {
  const ranges = [7 * 24, 24, 1];
  const period = Math.abs((date.getTime() - Date.now()) / (1000 * 60 * 60));
  const [dW, dD, dH] = ranges.map((delta, key) => (period % (key ? ranges[key - 1] : 1000)) / delta).map(Math.floor);
  return [[dW, 'w'], [dD, 'd'], [dH, 'h']].filter(([diff]) => diff).map(pair => pair.join('')).join(' ');
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
