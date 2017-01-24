const moment = require('moment');

const pgTimeToDate = time => new Date(`2000-01-01 ${time}`);

const dateTime = (date, time) => new Date([date, time].join('T'));

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
      const dur = moment.duration(moment(pgTimeToDate(endTime)).diff(moment(pgTimeToDate(startTime))));
      const hours = (dur.asHours() + 24) % 24;
      const hoursInt = Math.floor(hours);
      const minsInt = Math.ceil((hours % 1) * 60);
      data.duration = [hoursInt ? `${hoursInt}h` : '', minsInt ? ` ${minsInt}m` : ''].join('');
    }
  }
  return data;
}

function sortSchedule(slots) {
  if (!(slots && slots.length)) return [];
  const now = new Date();
  return slots.map(slot => Object.assign({}, {
    start: dateTime(slot.startDate, slot.startTime),
    end: dateTime(slot.startDate, slot.endTime),
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

module.exports = { parseSchedule, calendarLinks, sortSchedule, nextSchedule };
