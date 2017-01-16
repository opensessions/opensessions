import React, { PropTypes } from 'react';
import { Chart, LineChart } from 'react-d3-basic';

import LoadingMessage from '../../components/LoadingMessage';

import { apiFetch, apiModel } from '../../utils/api';

import styles from './styles.css';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const getMonthName = date => `${monthNames[date.getMonth()]}${date.getMonth() ? '' : ` ${date.getFullYear()}`}`;

export default class Dashboard extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    store: PropTypes.object,
    notify: PropTypes.func
  };
  static fetchData(dispatch, query) {
    return apiModel.search('session', { state: 'published' }).then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LIST_LOADED', payload: instances });
      return apiFetch('/api/admin/users').then(result => {
        dispatch({ type: 'USER_LIST_LOADED', payload: result.users });
      });
    });
  }
  constructor() {
    super();
    this.state = { isLoading: false, users: null };
  }
  componentDidMount() {
    if (!this.props.sessions) {
      this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
      this.constructor.fetchData(this.context.store.dispatch, this.props.location.query).then(() => {
        this.setState({ isLoading: false });
      }).catch(error => {
        this.context.notify(error, 'error');
      });
    }
  }
  renderChart(sessions, period, interval) {
    if (!sessions) return null;
    return (<div className={styles.chart}>
      <h1>Published sessions per {interval > 1 ? `${interval}-day period` : 'day'}</h1>
      {this.renderTimeChartFromCreatedObjects(sessions, 'updatedAt', period, interval)}
    </div>);
  }
  renderUserAnalytics() {
    const users = this.context.store.getState().get('userList');
    if (!users) return <div>Failed to load user information</div>;
    return <div className={styles.chart}>
      <h1>User Analytics</h1>
      <p>Total users: {users.length}</p>
      {this.renderTimeChartFromCreatedObjects(users, 'created_at', 26, 7)}
    </div>;
  }
  renderTimeChartFromCreatedObjects(objects, timeField, period, interval) {
    if (!objects) return null;
    const periods = (new Array(period)).join(',').split(',').map(v => 0);
    const MS_PER_INTERVAL = 1000 * 60 * 60 * 24 * interval;
    const intervalsAgo = date => Math.floor((Date.now() - date.getTime()) / MS_PER_INTERVAL);
    objects.forEach(object => {
      const interval = intervalsAgo(new Date(object[timeField]));
      if (interval in periods) periods[interval] = periods[interval] ? periods[interval] + 1 : 1;
    });
    const data = periods.map((val, key) => ({ day: new Date((Date.now() - (key * MS_PER_INTERVAL))), total: val }));
    return <LineChart
      width={960}
      height={320}
      data={data}
      showXGrid={true}
      showYGrid={true}
      chartSeries={[{ field: 'total', name: 'total', color: '#88C540', style: { 'stroke-width': 2 } }]}
      x={day => day ? day.day || 0 : 0}
      xScale="time"
    />;
  }
  render() {
    const { isLoading } = this.state;
    const sessions = this.context.store.getState().get('sessionList');
    return (<div>
      {isLoading ? <LoadingMessage message="Loading sessions" ellipsis /> : null}
      {sessions ? this.renderChart(sessions, 28, 1) : null}
      {/*sessions ? this.renderChart(sessions, 180, 1) : null*/}
      {sessions ? this.renderChart(sessions, 26, 7) : null}
      {this.renderUserAnalytics()}
    </div>);
  }
}
