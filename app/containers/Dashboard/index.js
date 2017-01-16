import React, { PropTypes } from 'react';
import { LineChart } from 'react-d3-basic';

import LoadingMessage from '../../components/LoadingMessage';

import { apiFetch, apiModel } from '../../utils/api';

import styles from './styles.css';

// const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// const getMonthName = date => `${monthNames[date.getMonth()]}${date.getMonth() ? '' : ` ${date.getFullYear()}`}`;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const intervalsAgo = (date, interval) => Math.floor((Date.now() - date.getTime()) / (MS_PER_DAY * interval));

export default class Dashboard extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    store: PropTypes.object,
    notify: PropTypes.func
  };
  static fetchData(dispatch) {
    return apiModel.search('session', { state: 'published' }).then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LIST_LOADED', payload: instances });
      return apiFetch('/api/admin/users').then(userResult => {
        dispatch({ type: 'USER_LIST_LOADED', payload: userResult.users });
        return apiFetch('/api/admin/emails').then(emailResult => {
          dispatch({ type: 'EMAIL_LIST_LOADED', payload: emailResult.emails });
        });
      });
    });
  }
  constructor() {
    super();
    this.state = { isLoading: false, users: null };
  }
  componentDidMount() {
    this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
    this.constructor.fetchData(this.context.store.dispatch).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
      this.setState({ isLoading: false });
    });
  }
  renderChart(sessions, period, interval) {
    if (!sessions) return null;
    return (<div className={styles.chart}>
      <h2>Published sessions per {interval > 1 ? `${interval}-day period` : 'day'}</h2>
      {this.renderTimeChartFromCreatedObjects(sessions, 'updatedAt', period, interval, 'session')}
    </div>);
  }
  renderSessionAnalytics() {
    const sessions = this.context.store.getState().get('sessionList');
    if (!sessions) return <div>No session information</div>;
    return (<div className={styles.chart}>
      <h1>Session Publishing Analytics</h1>
      <p>Total sessions: {sessions.length}</p>
      {this.renderChart(sessions, 42, 1)}
      {this.renderChart(sessions, 26, 7)}
    </div>);
  }
  renderUserAnalytics() {
    const users = this.context.store.getState().get('userList');
    if (!users) return <div>No user information</div>;
    return (<div className={styles.chart}>
      <h1>User Analytics</h1>
      <p>Total users: {users.length}</p>
      <p>Active users (online in last 28 days): {users.filter(user => intervalsAgo(new Date(user.last_login), 1) > 28).length}</p>
      {this.renderTimeChartFromCreatedObjects(users, 'created_at', 26, 7, 'user')}
    </div>);
  }
  renderTimeChartFromCreatedObjects(objects, timeField, intervalCount, interval, name) {
    if (!objects) return null;
    const periods = (new Array(intervalCount)).join(',').split(',').map(() => 0);
    let uncounted = 0;
    objects.forEach(object => {
      const intervalDiff = intervalsAgo(new Date(object[timeField]), interval);
      if (intervalDiff in periods) periods[intervalDiff] = periods[intervalDiff] ? periods[intervalDiff] + 1 : 1;
      else uncounted++;
    });
    const data = periods.map((val, key) => ({ time: new Date(Date.now() - (key * (MS_PER_DAY * interval))), total: val }));
    return (<div>
      <LineChart
        width={960}
        height={320}
        data={data}
        showXGrid
        showYGrid
        chartSeries={[{ field: 'total', name: 'total', color: '#88C540', style: { 'stroke-width': 2 } }]}
        x={period => period.time}
        xScale="time"
      />
      {uncounted ? <p>({uncounted} {name}s not plotted)</p> : null}
    </div>);
  }
  renderEmailAnalytics() {
    const emails = this.context.store.getState().get('emailList');
    if (!emails) return <div>No email information</div>;
    return (<div className={styles.chart}>
      <h1>Email Analytics</h1>
      <LineChart
        width={960}
        height={320}
        data={emails.map(day => ({ date: day.date, delivered: day.stats[0].metrics.delivered, unique_opens: day.stats[0].metrics.unique_opens, clicks: day.stats[0].metrics.clicks }))}
        x={email => new Date(email.date)}
        xScale="time"
        chartSeries={[
          { field: 'delivered', name: 'Delivered', color: '#1b9fde' },
          { field: 'unique_opens', name: 'Opens', color: '#aee25b' },
          { field: 'clicks', name: 'Clicks', color: '#e6c419' }
        ]}
      />
    </div>);
  }
  render() {
    const { isLoading } = this.state;
    return (<div>
      {isLoading ? <LoadingMessage message="Loading data" ellipsis /> : null}
      {this.renderSessionAnalytics()}
      {this.renderUserAnalytics()}
      {this.renderEmailAnalytics()}
    </div>);
  }
}
