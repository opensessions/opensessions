import React, { PropTypes } from 'react';

import Button from '../Button';

import styles from './styles.css';

const todayDate = (new Date()).toISOString().substr(0, 10);

export default class CalendarView extends React.Component {
  static propTypes = {
    month: PropTypes.string,
    renderItem: PropTypes.func,
    items: PropTypes.array,
    itemToDates: PropTypes.func,
    isWeekView: PropTypes.bool
  }
  getMonth() {
    return this.state && this.state.month ? this.state.month : this.props.month;
  }
  renderDay(day, itemDates) {
    if (!itemDates[day]) return <p className={styles.none}>No items</p>;
    return Object.keys(itemDates[day]).map(time => {
      const [hours, mins] = time.split(':').map(parseFloat);
      return ({ absMin: (hours * 60) + mins, hours, mins, time });
    }).sort((t1, t2) => t1.absMin - t2.absMin).map(({ hours, mins, time }) => (<div>
      <p className={styles.time}>{hours % 12 || 12}{mins ? `:${mins}` : ''}{hours >= 12 ? 'pm' : 'am'}</p>
      {itemDates[day][time].map(item => <p className={styles.items}>{this.props.renderItem(item, day)}</p>)}
    </div>));
  }
  renderWeek(week, itemDates) {
    const dayStyles = [styles.past, styles.today, styles.future];
    return (<ol className={styles.week}>
      {week.map(day => (day ? <li className={dayStyles[Math.sign(day.replace(/-/g, '') - todayDate.replace(/-/g, '')) + 1]}><span className={styles.day}>{day ? day.split('-')[2] : '-'}</span> {this.renderDay(day, itemDates)}</li> : <li className={styles.empty} />))}
    </ol>);
  }
  renderWeekTitles() {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return <ol className={styles.week}>{weekDays.map((day, key) => <li key={key}>{day}</li>)}</ol>;
  }
  render() {
    const month = this.getMonth();
    const { items, isWeekView, itemToDates } = this.props;
    const getWeeksInMonth = date => {
      const weeks = [];
      const trackMonth = new Date(date);
      let week = [];
      while (trackMonth.getMonth() === date.getMonth()) {
        const day = trackMonth.getDate();
        week.push(`${month}-${day > 9 ? day : `0${day}`}`);
        if (trackMonth.getDay() === 0) {
          if (weeks.length === 0) {
            while (week.length < 7) {
              week.unshift(null);
            }
          }
          weeks.push(week);
          week = [];
        }
        trackMonth.setDate(trackMonth.getDate() + 1);
      }
      if (week.length) {
        while (week.length < 7) {
          week.push(null);
        }
        weeks.push(week);
      }
      console.log('getWeeksInMonth', weeks);
      return weeks;
    };
    const getSingleWeek = date => {
      const trackDay = new Date(date);
      trackDay.setDate(trackDay.getDate() - trackDay.getDay());
      const week = [];
      do {
        const day = trackDay.getDate();
        const mon = trackDay.getMonth() + 1;
        const year = trackDay.getFullYear();
        week.push([year, mon, day].map(n => (n > 9 ? n : `0${n}`)).join('-'));
        trackDay.setDate(trackDay.getDate() + 1);
      } while (week.length < 7);
      return [week];
    };
    const getWeeks = date => (isWeekView ? getSingleWeek(date) : getWeeksInMonth(date));
    if (!items) return <p>No data</p>;
    const getItemDates = () => {
      const itemDates = {};
      items.forEach(item => {
        const dates = itemToDates(item);
        dates.forEach(date => {
          const [dateStr, time] = date.toISOString().substr(0, 16).split('T');
          if (!itemDates[dateStr]) itemDates[dateStr] = {};
          if (!itemDates[dateStr][time]) itemDates[dateStr][time] = [];
          itemDates[dateStr][time].push(item);
        });
      });
      return itemDates;
    };
    const itemDates = getItemDates();
    const monthDiff = diff => {
      const oldMonth = new Date([month, '12:00:00'].join('T'));
      const newMonth = new Date([month, '12:00:00'].join('T'));
      newMonth.setMonth(oldMonth.getMonth() + diff);
      return newMonth.toISOString().substr(0, 7);
    };
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (<div className={styles.calendar}>
      <div className={styles.tools}>
        <Button style="slim" onClick={() => this.setState({ month: monthDiff(-1) })}>🠜</Button>
        <h1>{months[parseInt(month.substr(5, 2), 10) - 1]} {month.substr(0, 4)}</h1>
        <Button style="slim" onClick={() => this.setState({ month: monthDiff(1) })}>🠞</Button>
      </div>
      <ol className={styles.month}>
        <li>{this.renderWeekTitles()}</li>
        {getWeeks(new Date(`${month}-01`)).map(week => <li>{this.renderWeek(week, itemDates)}</li>)}
      </ol>
    </div>);
  }
}
