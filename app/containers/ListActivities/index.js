import React, { PropTypes } from 'react';

import LoadingMessage from '../../components/LoadingMessage';

import { apiModel } from '../../utils/api';

export default class ListActivities extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object
  };
  static fetchData(dispatch) {
    return apiModel.search('activity').then(result => {
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
  render() {
    const isLoading = this.state ? this.state.isLoading : false;
    const activities = this.sortActivities();
    return (<div>
      <h1>List of activities</h1>
      {isLoading ? <LoadingMessage message="Loading activities" ellipsis /> : <ol>{activities.map(activity => <li>{activity.name} ({activity.SessionsCount})</li>)}</ol>}
    </div>);
  }
}
