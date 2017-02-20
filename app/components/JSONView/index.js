import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { timeAgo } from '../../utils/calendar';

import styles from './styles.css';

const isDate = data => {
  if (data.match && data.match(/^[\d\.]+$/)) return false;
  const date = new Date(data);
  return !isNaN(date) && date.getTime();
};

const isURL = data => data.match && data.match(/^http/);

export default class JSONView extends React.Component {
  static propTypes = {
    data: PropTypes.object
  }
  renderData(data) {
    if (data === null) return <span className={styles.false}>null</span>;
    if (data instanceof Object) return <JSONView data={data} />;
    if (isDate(data)) return <span className={styles.date} title={data}>{timeAgo(data)}</span>;
    if (isURL(data)) return <span className={styles.url}><Link to={data}>{data}</Link></span>;
    return `"${data.toString()}"`;
  }
  renderItem(key, data, hideKey) {
    return (<li key={key}>
      {hideKey ? null : <span className={styles.key}>{key}</span>}
      <span className={styles.value}>{this.renderData(data)}</span>
    </li>);
  }
  render() {
    const { data } = this.props;
    if (data instanceof Array) {
      return (<ol className={styles.list}>{data.map((val, key) => this.renderItem(key, val, true))}</ol>);
    }
    return (<ul className={styles.list}>
      {Object.keys(data).map(key => this.renderItem(key, data[key]))}
    </ul>);
  }
}
