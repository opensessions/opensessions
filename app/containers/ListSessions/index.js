import React, { PropTypes } from 'react';

import LoadingMessage from '../../components/LoadingMessage';
import SessionList from '../SessionList';

import { apiModel } from '../../utils/api';

export default class ListSessions extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func
  }
  constructor(props) {
    super(props);
    this.state = {
      sessions: []
    };
  }
  componentDidMount() {
    this.fetchData();
  }
  fetchData = () => {
    this.setState({ isLoading: true });
    return apiModel.search('session', { state: 'published' }).then(result => {
      const { instances, error } = result;
      if (error) this.context.notify(error, 'error');
      this.setState({ sessions: instances, isLoading: false });
    });
  }
  render() {
    const { sessions, isLoading } = this.state;
    return (<div>
      {isLoading ? <LoadingMessage message="Loading sessions" ellipsis /> : <SessionList heading="Here is a list of all published sessions:" sessions={sessions} />}
    </div>);
  }
}
