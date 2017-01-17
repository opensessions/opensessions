import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import LoadingMessage from '../../components/LoadingMessage';
import SessionList from '../SessionList';
import Button from '../../components/Button';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class ListSessions extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object
  };
  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object
  };
  static fetchData(dispatch, query) {
    return apiModel.search('session', { ...query, state: 'published' }).then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LIST_LOADED', payload: instances });
    });
  }
  constructor() {
    super();
    this.state = { isLoading: false };
  }
  componentDidMount() {
    this.fetchData(this.context.store.dispatch, this.props.location.query);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.fetchData(this.context.store.dispatch, nextProps.location.query);
    }
  }
  fetchData(dispatch, query) {
    this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
    this.constructor.fetchData(dispatch, query).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
    });
  }
  renderPagination(page, start, end, maxPage) {
    return (<div className={styles.pagination}>
      {page > 1 ? <Link className={styles.page} to={`/sessions/${page - 1}${this.props.location.search}`}>Previous page</Link> : null}
      <span> Page {page} of {maxPage} </span>
      {page < maxPage ? <Link className={styles.page} to={`/sessions/${page + 1}${this.props.location.search}`}>Next page</Link> : null}
    </div>);
  }
  render() {
    const { params } = this.props;
    const isLoading = this.state ? this.state.isLoading : false;
    const sessions = this.context.store.getState().get('sessionList');
    const limit = 10;
    const total = sessions ? sessions.length : 0;
    const page = (params && params.page) ? parseInt(params.page, 10) : 1;
    const maxPage = Math.ceil(total / limit);
    const [start, end] = [-1, 0].map(index => page + index).map(index => index * limit);
    const now = new Date();
    return (<div className={styles.list}>
      {total ? (<div>
        {this.renderPagination(page, start, end, maxPage)}
        {isLoading ? <LoadingMessage message="Loading sessions" ellipsis /> : <SessionList heading="Here is a list of all published sessions:" sessions={sessions ? sessions.slice(start, end) : []} />}
        {this.renderPagination(page, start, end, maxPage)}
      </div>) : <p>No sessions {this.props.location.search ? 'for this search' : null}</p>}
      <p>
        Popular searches:
        <Button to="/sessions">All</Button>
        <Button to={`/sessions?updatedAt=${now.toISOString().substr(0, 10)}`}>Updated today</Button>
        <Button to={`/sessions?updatedAt=${new Date((new Date()).setDate((new Date()).getDate() - 1)).toISOString().substr(0, 10)}`}>Updated yesterday</Button>
      </p>
    </div>);
  }
}
