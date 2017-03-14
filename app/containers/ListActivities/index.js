import React, { PropTypes } from 'react';

import LoadingMessage from '../../components/LoadingMessage';
import Button from '../../components/Button';

import { apiModel } from '../../utils/api';
import { timeAgo } from '../../utils/calendar';

import styles from './styles.css';

const hiddenActions = ['view'];
const actionNames = { giveParent: 'Set a parent', removeParent: 'Remove parent' };
const actionStyles = { delete: 'danger' };

export default class ListActivities extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object,
    router: PropTypes.object,
    modal: PropTypes.object
  };
  static fetchData(dispatch) {
    return apiModel.model('activity').act('list').then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'ACTIVITY_LIST_LOADED', payload: this.sortActivities(instances) });
    });
  }
  static sortActivities(activities) {
    return activities ? activities.sort((a, b) => {
      const [name1, name2] = [a, b].map(ac => ac.name.toLowerCase());
      const [parent1, parent2] = [a, b].map(ac => ac.parentUuid);
      return name1 > name2 && !parent1 === !parent2 ? 1 : -1;
    }) : [];
  }
  constructor() {
    super();
    this.state = { isLoading: false };
  }
  componentDidMount() {
    this.fetchData();
  }
  getActivities() {
    const activities = this.context.store.getState().get('activityList');
    return activities;
  }
  fetchData() {
    this.setState({ isLoading: true });
    this.constructor.fetchData(this.context.store.dispatch).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
      this.setState({ isLoading: false });
    });
  }
  actionClick = (activity, action) => {
    const activities = {};
    switch (action) {
      case 'merge':
        this.getActivities().forEach(a => {
          activities[a.uuid] = a.name;
        });
        this.context.modal.options(<span>Merge <b>{activity.name}</b> with which activity?</span>, activities, target => {
          apiModel.action('activity', activity.uuid, action, { target }).then(() => {
            this.fetchData();
          });
        });
        break;
      case 'giveParent':
        this.getActivities().forEach(a => {
          activities[a.uuid] = a.name;
        });
        this.context.modal.options(<span>Set which activity as parent to <b>{activity.name}</b>?</span>, activities, parentUuid => {
          apiModel.action('activity', activity.uuid, action, { parentUuid }).then(({ message, messageType }) => {
            if (message) this.context.notify(message, messageType || 'success');
            this.fetchData();
          });
        });
        break;
      case 'rename':
        const element = <span>New name for <b>{activity.name}</b>?</span>;
        const cb = name => {
          apiModel.action('activity', activity.uuid, action, { name }).then(({ message, messageType }) => {
            if (message) this.context.notify(message, messageType || 'success');
            this.fetchData();
          });
        };
        this.context.modal.prompt(element, cb, activity.name);
        break;
      default:
        this.context.modal.confirm(`Are you sure you want to ${action} ${activity.name}?`, () => apiModel.action('activity', activity.uuid, action).then(() => this.fetchData()));
        break;
    }
  }
  renderActivity(activity) {
    return (<li key={activity.uuid}>
      <span className={styles.name} title={activity.Sessions ? activity.Sessions.map(a => a.title).join('\n') : null}>
        {activity.parentUuid ? <span className={styles.parent}>🔗 </span> : null}
        {activity.name}
        {activity.Sessions.length ? <Button to={`/sessions?activity=${activity.name}`} className={styles.count}>{activity.Sessions.length}</Button> : null}
      </span>
      <span className={styles.actions}>{activity.actions.filter(action => hiddenActions.indexOf(action) === -1).map(
        action => <Button onClick={() => this.actionClick(activity, action)} style={action in actionStyles ? actionStyles[action] : null}>{action in actionNames ? actionNames[action] : action}</Button>
      )}</span>
      <span className={styles.time}>{timeAgo(new Date(activity.createdAt))}</span>
      {activity.Children ? <ol className={styles.children}>{activity.Children.map(child => <li>{child.name}</li>)}</ol> : null}
    </li>);
  }
  render() {
    const isLoading = this.state ? this.state.isLoading : false;
    const activities = this.getActivities();
    return (<div className={styles.list}>
      <h1>List of activities {activities ? `(${activities.length})` : null}</h1>
      {isLoading ? <LoadingMessage message="Loading activities" ellipsis /> : <ol>{activities ? activities.map(activity => this.renderActivity(activity)) : null}</ol>}
    </div>);
  }
}
