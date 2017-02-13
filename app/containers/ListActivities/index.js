import React, { PropTypes } from 'react';

import LoadingMessage from '../../components/LoadingMessage';
import Button from '../../components/Button';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class ListActivities extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object,
    router: PropTypes.object,
    modal: PropTypes.object
  };
  static fetchData(dispatch) {
    return apiModel.search('activity', { depth: 1 }).then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'ACTIVITY_LIST_LOADED', payload: instances });
    });
  }
  constructor() {
    super();
    this.state = { isLoading: false };
  }
  componentDidMount() {
    this.fetchData();
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
  sortActivities() {
    const activities = this.context.store.getState().get('activityList');
    return activities ? activities.sort((a, b) => {
      const [name1, name2] = [a, b].map(activity => activity.name.toLowerCase());
      return name1 > name2 ? 1 : -1;
    }) : [];
  }
  actionClick = (activity, action) => {
    const activities = {};
    switch (action) {
      case 'view':
        this.context.router.push(`/sessions?activity=${activity.name}`);
        break;
      case 'delete':
        this.context.modal.confirm(`Are you sure you want to delete ${activity.name}? This CANNOT be undone!`, () => apiModel.action('activity', activity.uuid, action).then(() => this.fetchData()));
        break;
      case 'merge':
        this.sortActivities().forEach(a => {
          activities[a.uuid] = a.name;
        });
        this.context.modal.options(<span>Merge <b>{activity.name}</b> with which activity?</span>, activities, target => {
          apiModel.action('activity', activity.uuid, 'merge', { target }).then(() => {
            this.fetchData();
          });
        });
        break;
      default:
        break;
    }
  }
  renderActivity(activity) {
    return (<li>
      <span className={styles.name}>{activity.name} {activity.Sessions.length ? <span className={styles.count}>{activity.Sessions.length}</span> : null}</span>
      <span className={styles.actions}>{activity.actions.map(action => <Button onClick={() => this.actionClick(activity, action)}>{action}</Button>)}</span>
    </li>);
  }
  render() {
    const isLoading = this.state ? this.state.isLoading : false;
    const activities = this.sortActivities();
    return (<div className={styles.list}>
      <h1>List of activities {activities ? `(${activities.length})` : null}</h1>
      {isLoading ? <LoadingMessage message="Loading activities" ellipsis /> : <ol>{activities.map(activity => this.renderActivity(activity))}</ol>}
    </div>);
  }
}
