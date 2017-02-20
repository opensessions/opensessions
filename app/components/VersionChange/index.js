import React, { PropTypes } from 'react';

import { timeAgo } from '../../utils/calendar';

import styles from './styles.css';

const shortDate = date => date.toISOString().substr(2, 8);
const reverseDate = date => date.split('-').reverse().join('-');
const shortDateReversed = date => reverseDate(shortDate(date));
const dateToString = date => {
  const now = shortDateReversed(new Date()).split('-');
  const then = shortDateReversed(date).split('-');
  let dateString = then.join('-');
  if (then[2] === now[2]) {
    dateString = then.slice(0, 2).join('-');
    if (then[1] === now[1]) {
      dateString = then.slice(0, 1).join('-');
      if (then[0] === now[0]) dateString = '';
    }
  }
  return `${date.toTimeString().substr(0, 5)} ${dateString}`;
};

export default class VersionChange extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    data: PropTypes.object,
    showDate: PropTypes.bool
  }
  render() {
    const { showDate, data } = this.props;
    const { analysis, messages, createdAt } = data;
    const created = new Date(createdAt);
    return (<div className={styles.versionChange}>
      {showDate ? <span className={styles.time}>{timeAgo(created)}</span> : null}
      {showDate ? <span className={styles.timeFull}>{dateToString(created)}</span> : null}
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
