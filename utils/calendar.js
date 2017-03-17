const moment = require('moment-timezone');
const { LOCALE_TIMEZONE } = process.env;

const pgTimeToDate = time => new Date(`2000-01-01 ${time}`);

const dateTime = (date, time) => new Date([date, time].join('T'));

function getDuration(start, end) {
  const diffMS = end.getTime() - start.getTime();
  const diffMinutes = diffMS / (60 * 1000);
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return [hours ? `${hours}h` : '', mins ? ` ${mins}m` : ''].join('');
}

function parseSchedule(slot) {
  const { startDate, startTime, endTime } = slot;
  const data = {};
  const now = new Date();
  if (startDate) {
    const date = dateTime(startDate, startTime || '00:00:00');
    data.date = moment(date).format(date.getFullYear() === now.getFullYear() ? 'dddd D MMM' : 'dddd D MMM YYYY');
    data.hasOccurred = date.getTime() <= now.getTime();
  }
  if (startTime) {
    data.time = startTime.slice(0, 5);
    if (endTime) {
      data.duration = getDuration(pgTimeToDate(startTime), pgTimeToDate(endTime));
    }
  }
  return data;
}

function sortSchedule(slots) {
  if (!(slots && slots.length)) return [];
  const now = new Date();
  const defaultTime = { start: '00:00:00', end: '23:59:59' };
  return slots.map(slot => Object.assign({}, {
    start: dateTime(slot.startDate, slot.startTime),
    end: dateTime(slot.startDate, slot.endTime),
    points: ['start', 'end'].map(point => moment.tz(`${slot.startDate}T${slot[`${point}Time`] || defaultTime[point]}`, LOCALE_TIMEZONE).utc().format()),
    hasOccurred: dateTime(slot.startDate, slot.startTime || '00:00:00').getTime() <= now.getTime()
  }, slot)).sort((a, b) => a.start - b.start);
}

function nextSchedule(slots) {
  return sortSchedule(slots).find(slot => slot.start > Date.now());
}

function calendarLinks(schedule, title, description, location) {
  const { startDate, startTime, endTime } = schedule;
  const dates = [startTime, endTime].map(time => [startDate, time].join('T').replace(/-|:|\.\d\d\d/g, ''));
  return {
    googleCalendar: `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates.join('/')}&details=${description}&location=${location}&sprop=&sprop=name:`
  };
}

module.exports = { pgTimeToDate, getDuration, parseSchedule, calendarLinks, sortSchedule, nextSchedule };
