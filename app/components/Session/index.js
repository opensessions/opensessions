import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { timeAgo } from '../../utils/calendar';

import styles from './styles.css';

export default class Session extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: PropTypes.object.isRequired
  }
  render() {
    const { session } = this.props;
    const { info, image } = session;
    return (<div className={styles.session}>
      <img src={image || '/images/placeholder.png'} role="presentation" />
      <Link to={session.href} className={styles.title}>{session.title}</Link>
      {Object.keys(info.contact).filter(key => info.contact[key]).map(key => <span>{key}: {info.contact[key]}</span>)}
      <b>updated: {timeAgo(new Date(session.updatedAt))}</b>
    </div>);
  }
}
