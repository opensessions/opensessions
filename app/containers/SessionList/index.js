import React from 'react';

import { apiFetch } from '../../utils/api';

import SessionTileView from 'containers/SessionTileView';
import LoadingMessage from 'components/LoadingMessage';

import styles from './styles.css';

export default class SessionList extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    query: React.PropTypes.string
  }
  constructor() {
    super();
    this.state = { session: [], status: 'loading' };
  }
  componentDidMount() {
    this.fetchSessions();
  }
  fetchSessions() {
    apiFetch(`/api/session?${this.props.query}`).then((result) => {
      const { instances, error } = result;
      if (error) {
        this.setState({ status: error });
      } else if (instances) {
        this.setState({ sessions: instances, status: 'done' });
      }
    });
  }
  renderSessions() {
    const { sessions, status } = this.state;
    if (status === 'loading') return <LoadingMessage message="Loading sessions" ellipsis />;
    if (!sessions) return <p>You haven't created any sessions yet, click the button below to create a session.</p>;
    return (<div>
      <p>These are the sessions you've created so far:</p>
      <ol>
        {sessions.map((session) => <li key={session.uuid}><SessionTileView session={session} /></li>)}
      </ol>
    </div>);
  }
  render() {
    return (<div className={styles.sessionList}>
      {this.renderSessions()}
    </div>);
  }
}
