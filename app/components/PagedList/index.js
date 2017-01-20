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
    noneMessage: PropTypes.any,
    newUrl: PropTypes.func,
  }
  renderPagination(page, start, end, maxPage) {
    const { newUrl } = this.props;
    return (<div className={styles.pagination}>
      {page > 1 ? <Button to={newUrl(1)} style="slim">Start</Button> : null}
      {page > 1 ? <Button to={newUrl(page - 1)} style="slim">🠜</Button> : null}
      <span> Page {page} of {maxPage} </span>
      {page < maxPage ? <Button to={newUrl(page + 1)} style="slim">🠞</Button> : null}
      {page < maxPage ? <Button to={newUrl(maxPage)} style="slim">End</Button> : null}
    </div>);
  }
  render() {
    const { items, itemToProps, Component, page, noneMessage } = this.props;
    const limit = 10;
    const total = items ? items.length : 0;
    const maxPage = Math.ceil(total / limit);
    const [start, end] = [-1, 0].map(index => page + index).map(index => index * limit);
    if (!total) return <p>{noneMessage}</p>;
    return (<div className={styles.list}>
      {this.renderPagination(page, start, end, maxPage)}
      <ol>{items.slice(start, end).map((item, key) => <li key={key + start}><Component {...itemToProps(item)} /></li>)}</ol>
      {this.renderPagination(page, start, end, maxPage)}
    </div>);
  }
}
