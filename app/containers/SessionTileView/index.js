import React from 'react';
import { Link } from 'react-router';

import styles from './styles.css';

export default class SessionTileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: React.PropTypes.object,
  }
  render() {
    const { session } = this.props;
    return (
      <article className={styles.tile}>
        <h1><Link to={session.href}>{session.displayName}</Link></h1>
      </article>
    );
  }
}
