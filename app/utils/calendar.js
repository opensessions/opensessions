import moment from 'moment';

import { pgTimeToDate } from './postgres';

export function parseSchedule(instance) {
  const { startDate, startTime, endTime } = instance;
  const data = {};
  const now = new Date();
  if (startDate) {
    const date = new Date(startDate);
    data.date = moment(date).format('dddd D MMM');
    if (date.getFullYear() !== now.getFullYear()) data.date = moment(date).format('dddd D MMM YYYY');
    data.hasOccurred = date.getTime() <= now.getTime();
  }
  if (startTime) {
    data.time = startTime.split(':').slice(0, 2).join(':');
    if (endTime) {
      const dur = moment.duration(moment(pgTimeToDate(endTime)).diff(moment(pgTimeToDate(startTime))));
      const hours = (dur.asHours() + 24) % 24;
      const hoursInt = Math.floor(hours);
      const minsInt = Math.ceil((hours % 1) * 60);
      data.duration = `${hoursInt ? `${hoursInt}h` : ''}${minsInt ? ` ${minsInt}m` : ''}`;
    }
  }
  return data;
}

export function calendarLinks(schedule, title, description, location) {
  const { startDate, startTime, endTime } = schedule;
  const dates = [startTime, endTime].map(time => [startDate, startTime].join('T').replace(/-|:|\.\d\d\d/g, ''));
  return {
    googleCalendar: `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates.join('/')}&details=${description}&location=${location}&sprop=&sprop=name:`
  };
}