import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { apiFetch } from '../../utils/api';

import SessionTileView from 'containers/SessionTileView';
import LoadingMessage from 'components/LoadingMessage';

import styles from './styles.css';

export default class SessionList extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    sessions: PropTypes.array,
    query: PropTypes.string
  }
  constructor(props) {
    super();
    this.state = { sessions: [], status: 'loading' };
    if (props.sessions) {
      this.state = { sessions: props.sessions, status: 'passed' };
    }
  }
  componentDidMount() {
    if (!this.props.sessions) {
      this.fetchData();
    }
  }
  componentWillReceiveProps(props) {
    const { sessions } = props;
    if (sessions) {
      this.setState({ sessions: props.sessions, status: 'passed' });
    }
  }
  fetchData() {
    apiFetch(`/api/session?${this.props.query}`).then(result => {
      const { instances, error } = result;
      if (instances) this.setState({ sessions: instances, status: 'done' });
      if (error) this.setState({ status: error });
    });
  }
  render() {
    const { sessions, status } = this.state;
    if (status === 'loading') return <div className={styles.sessionList}><LoadingMessage message="Loading sessions" ellipsis /></div>;
    return (<div className={styles.sessionList}>
      <p className={styles.intro}>{sessions.length ? 'These are the sessions you\'ve created so far:' : 'You haven\'t created any sessions yet! Click the button below to create a session.'}</p>
      <ol className={styles.list}>
        {sessions.map((session) => <li key={session.uuid}><SessionTileView session={session} /></li>)}
      </ol>
      <p><Link to="/session/add" className={styles.add}>+ Add a session</Link></p>
    </div>);
  }
}
