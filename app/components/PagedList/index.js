import React, { PropTypes } from 'react';

import Button from '../Button';

import styles from './styles.css';

export default class PagedList extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object,
    router: PropTypes.object
  };
  static propTypes = {
    items: PropTypes.array,
    itemToProps: PropTypes.func,
    location: PropTypes.object,
    Component: PropTypes.object,
    page: PropTypes.number,
    limit: PropTypes.number,
    noneMessage: PropTypes.any,
    newUrl: PropTypes.func,
    isSlim: PropTypes.bool,
  }
  getPage() {
    return this.state && this.state.pageOverride ? this.state.pageOverride : this.props.page;
  }
  renderPagination(start, end, pages) {
    const { newUrl } = this.props;
    const page = this.getPage();
    const pageToProps = n => (newUrl ? { to: newUrl(n) } : { onClick: () => this.setState({ pageOverride: n }) });
    return (<div className={styles.pagination}>
      {page > 1 ? <Button {...pageToProps(1)} style="slim">Start</Button> : null}
      {page > 1 ? <Button {...pageToProps(page - 1)} style="slim">🠜</Button> : null}
      <span> Page {page} of {pages} </span>
      {page < pages ? <Button {...pageToProps(page + 1)} style="slim">🠞</Button> : null}
      {page < pages ? <Button {...pageToProps(pages)} style="slim">End</Button> : null}
    </div>);
  }
  render() {
    const { items, itemToProps, Component, noneMessage, isSlim } = this.props;
    const page = this.getPage();
    let { limit } = this.props;
    limit = limit || 10;
    const total = items ? items.length : 0;
    const pages = Math.ceil(total / limit);
    const [start, end] = [-1, 0].map(index => page + index).map(index => index * limit);
    if (!total) return <p>{noneMessage}</p>;
    return (<div className={[styles.list, isSlim ? styles.slim : ''].join(' ')}>
      {this.renderPagination(start, end, pages)}
      <ol>{items.slice(start, end).map((item, key) => <li key={key + start}><Component {...itemToProps(item)} /></li>)}</ol>
      {this.renderPagination(start, end, pages)}
    </div>);
  }
}
