import React, { PropTypes } from 'react';

import LoadingMessage from '../../components/LoadingMessage';
import Button from '../../components/Button';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class ListActivities extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object,
    router: PropTypes.object
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
    this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
    this.constructor.fetchData(this.context.store.dispatch).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
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
    switch (action) {
      case 'view':
        this.context.router.push(`/sessions?activity=${activity.name}`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${activity.name}? This CANNOT be undone!`)) {
          apiModel.action('activity', activity.uuid, action).then(() => {
            this.setState({ isLoading: true });
            this.constructor.fetchData(this.context.store.dispatch).then(() => {
              this.setState({ isLoading: false });
            });
          });
        }
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
      <h1>List of activities</h1>
      {isLoading ? <LoadingMessage message="Loading activities" ellipsis /> : <ol>{activities.map(activity => this.renderActivity(activity))}</ol>}
    </div>);
  }
}
