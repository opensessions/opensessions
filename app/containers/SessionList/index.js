import React, { PropTypes } from 'react';

import { apiModel } from '../../utils/api';

import SessionTileView from '../SessionTileView';
import Button from '../../components/Button';
import LoadingMessage from '../../components/LoadingMessage';

import styles from './styles.css';

export default class SessionList extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    sessions: PropTypes.array,
    heading: PropTypes.node,
    hideButton: PropTypes.bool,
    query: PropTypes.object
  };
  static contextTypes = {
    notify: PropTypes.func,
    onExpire: PropTypes.func
  };
  static childContextTypes = {
    onExpire: PropTypes.func
  }
  constructor(props) {
    super();
    this.state = { sessions: [], isLoading: true };
    if (props.sessions) {
      this.state = { sessions: props.sessions, isLoading: false };
    }
  }
  getChildContext() {
    return {
      onExpire: () => (this.props.sessions ? this.context.onExpire() : this.fetchData())
    };
  }
  componentDidMount() {
    if (!this.props.sessions) {
      this.fetchData();
    }
  }
  componentWillReceiveProps(props) {
    const { sessions } = props;
    if (sessions) {
      this.setState({ sessions: props.sessions, isLoading: false });
    }
  }
  fetchData() {
    return apiModel.search('session', this.props.query).then(result => {
      const { instances, error } = result;
      if (instances) this.setState({ sessions: instances, isLoading: false });
      if (error) {
        this.context.notify('Failed to load sessions', 'error');
        this.setState({ isLoading: false });
      }
    });
  }
  render() {
    const { hideButton } = this.props;
    let { heading } = this.props;
    const { sessions, isLoading } = this.state;
    if (!heading) heading = <p className={styles.intro}>{sessions.length ? 'These are the sessions you\'ve created so far:' : 'You haven\'t created any sessions yet! Click the button below to create a session.'}</p>;
    if (isLoading) return <div className={styles.sessionList}><LoadingMessage message="Loading sessions" ellipsis /></div>;
    return (<div className={styles.sessionList}>
      {heading}
      <ol className={styles.list}>
        {sessions.map(session => <li key={session.uuid}><SessionTileView session={session} /></li>)}
      </ol>
      {hideButton ? null : <p><Button to="/session/add">+ Add a session</Button></p>}
    </div>);
  }
}
