import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import LoadingMessage from '../../components/LoadingMessage';
import SessionList from '../SessionList';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class ListSessions extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func
  };
  static propTypes = {
    params: PropTypes.object
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
    const { params } = this.props;
    const { sessions, isLoading } = this.state;
    const page = (params && params.page) ? parseInt(params.page, 10) : 1;
    const limit = 20;
    const pageStart = (page - 1) * limit;
    const pageEnd = pageStart + limit;
    return (<div>
      {isLoading ? <LoadingMessage message="Loading sessions" ellipsis /> : <SessionList heading="Here is a list of all published sessions:" sessions={sessions.slice(pageStart, pageEnd)} />}
      <div className={styles.pagination}>
        {pageStart > 0 ? <Link className={styles.page} to={`/sessions/${page - 1}`}>Previous page</Link> : null}
        Page {page}
        {sessions.length > pageEnd ? <Link className={styles.page} to={`/sessions/${page + 1}`}>Next page</Link> : null}
      </div>
    </div>);
  }
}
