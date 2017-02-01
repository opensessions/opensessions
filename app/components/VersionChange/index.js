import React, { PropTypes } from 'react';

import { formatTime } from '../../utils/calendar';

import styles from './styles.css';

export default class VersionChange extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    data: PropTypes.object
  }
  render() {
    const { analysis, messages, createdAt } = this.props.data;
    const created = new Date(createdAt);
    return (<div className={styles.versionChange}>
      <span className={styles.time}>{formatTime(created)}</span>:
      v{analysis.version}
      {analysis.gitHead
        ? (<span>
          <a href={`https://github.com/opensessions/opensessions/commit/${analysis.gitHead}`} className={styles.tag}>#{analysis.gitHead.slice(0, 7)}</a>
          <span className={styles.changes}>{messages && messages.length ? messages.map(msg => `+ ${msg}`).reverse().join('\n') : 'No git messages this far back'}</span>
        </span>)
        : null}
    </div>);
  }
}
