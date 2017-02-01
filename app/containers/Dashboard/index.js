import React, { PropTypes } from 'react';
import { LineChart, PieChart, BarGroupChart } from 'react-d3-basic';

import LoadingMessage from '../../components/LoadingMessage';
import PagedList from '../../components/PagedList';
import Checkbox from '../../components/Fields/Checkbox';
import VersionChange from '../../components/VersionChange';
import UserSessions from '../../components/UserSessions';

import { apiFetch, apiModel } from '../../utils/api';
import { formatTime, intervalsAgo, cleanDate } from '../../utils/calendar';

import styles from './styles.css';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const emailCategories = [{ name: 'Expiry', id: 'engagement-expiring' }, { name: 'Live sessions', id: 'engagement-live' }, { name: 'Finish your listing', id: 'engagement-finishlisting' }];

const layout = {
  width: 816,
  height: 320,
  margins: { left: 32, right: 24, top: 20, bottom: 20 }
};

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
        return apiFetch(`/api/admin/emails?days=56&categories=${emailCategories.map(cat => cat.id).join(',')}`).then(emailResult => {
          dispatch({ type: 'EMAIL_LIST_LOADED', payload: emailResult.emails });
          return apiFetch('/api/analysis').then(analysisResult => {
            dispatch({ type: 'ANALYSIS_LIST_LOADED', payload: analysisResult.instances });
          });
        });
      });
    });
  }
  constructor() {
    super();
    this.state = { isLoading: false, sessionLength: 8, usersWeekly: true };
  }
  componentDidMount() {
    this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
    this.constructor.fetchData(this.context.store.dispatch).then(() => {
      this.setState({ isLoading: false });
      fetch('https://api.github.com/repos/opensessions/opensessions/commits').then(json => json.json()).then(commits => this.setState({ commits }));
    }).catch(error => {
      this.context.notify(error, 'error');
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
  renderSessionAnalytics() {
    const { isLoading } = this.state;
    if (isLoading) return <LoadingMessage message="Loading sessions" ellipsis />;
    const sessions = this.context.store.getState().get('sessionList');
    if (!sessions) return <div>No session information</div>;
    const { sessionWeekly, sessionLength } = this.state;
    const periodLength = sessionWeekly ? 7 : 1;
    const aggregators = {};
    sessions.map(session => session.aggregators).forEach(aggList => {
      aggList.forEach(agg => {
        aggregators[agg.name] = (aggregators[agg.name] || 0) + 1;
      });
    });
    const aggStats = Object.keys(aggregators).map(name => ({ name, total: aggregators[name] }));
    return (<div className={styles.chart}>
      <h1>Session Publishing Analytics</h1>
      <p>Total sessions: {sessions.length}</p>
      <ol className={styles.blocks}>
        <li>
          {this.renderChart(sessions, sessionLength || 8, periodLength)}
          <p><Checkbox checked={sessionWeekly} onChange={() => this.setState({ sessionWeekly: !sessionWeekly })} label="Per week" /></p>
          <p><label>Zoom</label> + <input type="range" min={8} max={64} step={8} value={sessionLength} onChange={event => this.setState({ sessionLength: parseInt(event.target.value, 10) })} /> -</p>
        </li>
        <li>
          <h2>Aggregators</h2>
          <PieChart
            width={280}
            height={320}
            data={aggStats}
            name={item => item.name}
            value={item => item.total}
            chartSeries={aggStats.map(agg => ({ field: agg.name, name: `${agg.name}: ${agg.total}`, value: agg.total }))}
          />
        </li>
      </ol>
    </div>);
  }
  renderUserSessions() {
    const { isLoading } = this.state;
    if (isLoading) return <LoadingMessage message="Loading user sessions" ellipsis />;
    const users = this.context.store.getState().get('userList');
    const sessions = this.context.store.getState().get('sessionList');
    if (!users || !sessions) return <LoadingMessage message="Loading user sessions" ellipsis />;
    const userSessions = users.map(user => ({ user, sessions: sessions.filter(s => s.owner === user.user_id) }));
    return (<div className={styles.chart}>
      <h1>User List</h1>
      <PagedList items={userSessions} page={1} itemToProps={item => item} Component={UserSessions} />
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
  renderEmailAnalytics() {
    const { isLoading } = this.state;
    if (isLoading) return <LoadingMessage message="Loading email data" ellipsis />;
    const emails = this.context.store.getState().get('emailList');
    if (!emails) return <div>No email information</div>;
    return (<div className={styles.chart}>
      <h1>Email Analytics</h1>
      <ol className={styles.blocks}>
        {emailCategories.map(type => (<li>
          <h2>{type.name} email</h2>
          <LineChart
            {...layout}
            data={emails.map(day => ({ date: new Date(day.date), stats: day.stats.find(cat => cat.name === type.id).metrics })).map(day => ({ ...day, ...day.stats }))}
            x={email => email.date}
            xScale="time"
            chartSeries={[
              { field: 'delivered', name: 'Delivered', color: '#1b9fde', style: { strokeWidth: 2 } },
              { field: 'unique_opens', name: 'Opens', color: '#aee25b', style: { strokeWidth: 2 } },
              { field: 'clicks', name: 'Clicks', color: '#e6c419', style: { strokeWidth: 2 } }
            ]}
          />
        </li>))}
      </ol>
    </div>);
  }
  renderAnalysisHistory() {
    const { isLoading } = this.state;
    if (isLoading) return <LoadingMessage message="Loading app analysis" ellipsis />;
    const analysisList = this.context.store.getState().get('analysisList');
    if (!analysisList) return <div>No analysis data</div>;
    const versionChanges = [];
    let lastVersion = null;
    const getMessages = (since, current) => {
      if (!this.state.commits || !current) return [];
      const msgs = [];
      let recordMsg = false;
      this.state.commits.forEach(({ sha, commit }) => {
        if (sha === current) recordMsg = true;
        if (sha === since) recordMsg = false;
        if (recordMsg) msgs.push(`${commit.message}, ${cleanDate(new Date(commit.author.date))} ago`);
      });
      return msgs;
    };
    analysisList.forEach(data => {
      if (lastVersion !== data.analysis.gitHead) versionChanges.push({ ...data, messages: getMessages(lastVersion, data.analysis.gitHead) });
      if (data.analysis.gitHead) lastVersion = data.analysis.gitHead;
    });
    const now = new Date();
    return (<div className={styles.chart}>
      <h1>App Analysis</h1>
      <h2>Small Version changes</h2>
      <PagedList items={versionChanges} page={1} itemToProps={data => ({ data })} Component={VersionChange} />
      <p>{formatTime(now)}</p>
    </div>);
  }
  render() {
    return (<div>
      {this.renderSessionAnalytics()}
      {this.renderUserAnalytics()}
      {this.renderUserSessions()}
      {this.renderEmailAnalytics()}
      {this.renderAnalysisHistory()}
    </div>);
  }
}
