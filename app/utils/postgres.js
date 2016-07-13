import moment from 'moment';

export function pgTimeToDate(time) {
  return new Date(`2000-01-01 ${time}`);
}

export function parseSchedule(instance) {
  const { startDate, startTime, endTime } = instance;
  const data = {};
  if (startDate) {
    const date = new Date(startDate);
    data.date = moment(date).format('dddd D MMM');
  }
  if (startTime) {
    const time = startTime ? startTime.split(':') : ['00', '00', '00'];
    time.pop();
    data.time = time.join(':');
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
