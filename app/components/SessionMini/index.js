import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import styles from './styles.css';

export default class SessionMini extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: PropTypes.object
  }
  render() {
    const { session } = this.props;
    return <span className={styles.session} style={{ backgroundImage: `url(${session.image})` }}><Link className={styles.link} to={session.href}>{session.title}</Link></span>;
  }
}
