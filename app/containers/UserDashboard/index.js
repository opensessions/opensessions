import React, { PropTypes } from 'react';
import { LineChart, BarGroupChart } from 'react-d3-basic';

import PartnerMini from '../../components/PartnerMini';
import LoadingMessage from '../../components/LoadingMessage';
import Button from '../../components/Button';
import PagedList from '../../components/PagedList';
import Checkbox from '../../components/Fields/Checkbox';
import UserSessions from '../../components/UserSessions';

import { apiFetch, apiModel } from '../../utils/api';
import { intervalsAgo } from '../../utils/calendar';

import styles from './styles.css';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const layout = {
  width: 816,
  height: 320,
  margins: { left: 32, right: 24, top: 20, bottom: 20 }
};

export default class UserDashboard extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    store: PropTypes.object,
    notify: PropTypes.func
  };
  static childContextTypes = {
    onExpire: PropTypes.func
  };
  static fetchData(dispatch) {
    return apiModel.search('session', { state: 'published' })
      .then(({ instances }) => dispatch({ type: 'SESSION_LIST_LOADED', payload: instances }))
      .then(() => apiFetch('/api/admin/users'))
      .then(({ users }) => dispatch({ type: 'USER_LIST_LOADED', payload: users }))
      .then(() => apiModel.search('partner', {}))
      .then(({ instances }) => dispatch({ type: 'PARTNER_LIST_LOADED', payload: instances }));
  }
  constructor() {
    super();
    this.state = { isLoading: false, sessionLength: 8, usersWeekly: true };
  }
  getChildContext() {
    return {
      onExpire: () => this.fetchData()
    };
  }
  componentDidMount() {
    this.fetchData().catch(error => {
      this.context.notify(error, 'error');
      this.setState({ isLoading: false });
    });
  }
  fetchData() {
    this.setState({ isLoading: true });
    return this.constructor.fetchData(this.context.store.dispatch).then(() => {
      this.setState({ isLoading: false });
    });
  }
  renderChart(sessions, period, interval) {
    if (!sessions) return null;
    return (<div className={styles.chart}>
      <h2>Published sessions</h2>
      {this.renderTimeChartFromCreatedObjects(sessions, 'updatedAt', period, interval, 'session')}
    </div>);
  }
  renderUserSessions() {
    const { isLoading } = this.state;
    if (isLoading) return <LoadingMessage message="Loading user sessions" ellipsis />;
    const users = this.context.store.getState().get('userList');
    const sessions = this.context.store.getState().get('sessionList');
    if (!users || !sessions) return <LoadingMessage message="Loading user sessions" ellipsis />;
    const userSessions = users.sort((a, b) => (new Date(b.last_login)).getTime() - (new Date(a.last_login)).getTime()).map(user => ({ user, sessions: sessions.filter(s => s.owner === user.user_id) }));
    return (<div>
      <h1>User List</h1>
      <PagedList limit={16} orientation="top" isSlim items={userSessions} page={1} itemToProps={item => item} Component={UserSessions} />
    </div>);
  }
  renderUserAnalytics() {
    const { isLoading, usersWeekly } = this.state;
    if (isLoading) return <LoadingMessage message="Loading users" ellipsis />;
    const users = this.context.store.getState().get('userList');
    const sessions = this.context.store.getState().get('sessionList');
    if (!users || !sessions) return <div>No user information</div>;
    const sessionOwners = sessions.map(session => session.owner);
    const liveSessionOwners = sessions.filter(session => session.sortedSchedule.some(slot => !slot.hasOccurred)).map(session => session.owner);
    const totalUsers = users.length;
    const activeUsers = users.filter(user => intervalsAgo(new Date(user.last_login), 1) > 28).length;
    const publishedUsers = users.filter(user => sessionOwners.some(owner => owner === user.user_id)).length;
    const publishedActive = users.filter(user => liveSessionOwners.some(owner => owner === user.user_id)).length;
    const percentDescriptions = ['are "active" (have logged in within the last 28 days)', 'have ever published a session', 'have published a session which has upcoming sessions'];
    return (<div className={styles.chart}>
      <h1>User Analytics</h1>
      <p>Total users: {totalUsers} | Active users (online in last 28 days): {activeUsers} | Published users: {publishedUsers}</p>
      <ol className={styles.blocks}>
        <li>
          <h2>New sign-ups</h2>
          {this.renderTimeChartFromCreatedObjects(users, 'created_at', 26, usersWeekly ? 7 : 1, 'user')}
          <p><Checkbox checked={usersWeekly} onChange={checked => this.setState({ usersWeekly: checked })} label="Per week" /></p>
        </li>
        <li>
          <h2>User totals</h2>
          <BarGroupChart
            width={320}
            height={400}
            data={[{ activeUsers, publishedUsers, totalUsers, publishedActive }]}
            chartSeries={[
              { field: 'activeUsers', name: 'Active users', color: '#88c540' },
              { field: 'publishedUsers', name: 'Published users (all time)', color: '#1b91cd' },
              { field: 'publishedActive', name: 'Published users (live)', color: '#eade37' },
              { field: 'totalUsers', name: 'All users', color: '#AAA' }
            ]}
            showXGrid={false}
            showYGrid={false}
            x={() => 'Users'}
            xScale="ordinal"
          />
          {[activeUsers, publishedUsers, publishedActive].map((list, key) => <p>{((list / totalUsers) * 100).toFixed(1)}% of users {percentDescriptions[key]}</p>)}
        </li>
      </ol>
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
        {...layout}
        data={data}
        showXGrid
        showYGrid
        chartSeries={[{ field: 'total', name: 'total', color: '#88C540', style: { strokeWidth: 2 } }]}
        x={period => period.time}
        xScale="time"
      />
      {uncounted ? <p>({uncounted} {name}s not plotted)</p> : null}
    </div>);
  }
  renderPartnerAdmin() {
    const { isLoading } = this.state;
    if (isLoading) return <LoadingMessage message="Loading app analysis" ellipsis />;
    const partners = this.context.store.getState().get('partnerList');
    const users = this.context.store.getState().get('userList');
    if (!users) return null;
    const userList = {};
    users.forEach(user => {
      userList[user.user_id] = `${user.name} <${user.email}>`;
    });
    return (<div>
      <h1>Partner Portal</h1>
      <PagedList orientation="bottom" isSlim items={partners} page={1} itemToProps={item => ({ partner: item })} Component={PartnerMini} />
      <p><Button onClick={() => this.context.modal.options('Select a user to make a Partner Portal user:', userList, userId => apiModel.new('partner', { userId }).then(() => this.fetchData()))}>+ Add a partner</Button></p>
    </div>);
  }
  render() {
    return (<div className={styles.dashboard}>
      <h1>User Dashboard</h1>
      <div className={`${styles.chart} ${styles.cols}`}>
        {this.renderUserSessions()}
        {this.renderPartnerAdmin()}
      </div>
      {this.renderUserAnalytics()}
    </div>);
  }
}
