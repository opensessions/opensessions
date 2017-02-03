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
    orientation: PropTypes.string
  }
  getPage() {
    return this.state && this.state.pageOverride ? this.state.pageOverride : this.props.page;
  }
  pageOverride(pageOverride) {
    this.setState({ pageOverride });
    const { scrollTo, innerHeight } = window;
    scrollTo(0, this.refs.list.offsetTop - (innerHeight / 4));
  }
  renderPagination(start, end, pages) {
    const { newUrl } = this.props;
    const page = this.getPage();
    const pageToProps = n => (newUrl ? { to: newUrl(n) } : { onClick: () => this.pageOverride(n) });
    return (<div className={styles.pagination}>
      <Button {...pageToProps(1)} style={page > 1 ? 'slim' : ['slim', 'disabled']}>Start</Button>
      <Button {...pageToProps(page - 1)} style={page > 1 ? 'slim' : ['slim', 'disabled']}>🠜</Button>
      <span> Page {page} of {pages} </span>
      <Button {...pageToProps(page + 1)} style={page < pages ? 'slim' : ['slim', 'disabled']}>🠞</Button>
      <Button {...pageToProps(pages)} style={page < pages ? 'slim' : ['slim', 'disabled']}>End</Button>
    </div>);
  }
  render() {
    const { items, itemToProps, Component, noneMessage, isSlim, orientation } = this.props;
    const page = this.getPage();
    let { limit } = this.props;
    limit = limit || 10;
    const total = items ? items.length : 0;
    const pages = Math.ceil(total / limit);
    const [start, end] = [-1, 0].map(index => page + index).map(index => index * limit);
    if (!total) return <p>{noneMessage}</p>;
    return (<div className={[styles.list, isSlim ? styles.slim : ''].join(' ')} ref="list">
      {orientation !== 'bottom' && pages > 1 ? this.renderPagination(start, end, pages) : null}
      <ol>{items.slice(start, end).map((item, key) => <li key={key + start}><Component {...itemToProps(item)} /></li>)}</ol>
      {orientation !== 'top' && pages > 1 ? this.renderPagination(start, end, pages) : null}
    </div>);
  }
}
