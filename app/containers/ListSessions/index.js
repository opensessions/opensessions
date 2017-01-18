import React, { PropTypes } from 'react';

import LoadingMessage from '../../components/LoadingMessage';
import SessionList from '../SessionList';
import Button from '../../components/Button';
import Checkbox from '../../components/Fields/Checkbox';

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
    this.state = { isLoading: false, showExpired: true };
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
      {page > 1 ? <Button to={`/sessions/${page - 1}${this.props.location.search}`}>Previous</Button> : null}
      <span> Page {page} of {maxPage} </span>
      {page < maxPage ? <Button to={`/sessions/${page + 1}${this.props.location.search}`}>Next</Button> : null}
    </div>);
  }
  renderFilters() {
    const now = new Date();
    const filters = [
      { search: '', name: 'All' },
      { search: `?updatedAt=${now.toISOString().substr(0, 10)}`, name: 'Updated today' },
      { search: `?updatedAt=${new Date((new Date()).setDate(now.getDate() - 1)).toISOString().substr(0, 10)}`, name: 'Updated yesterday' }
    ];
    const { search } = this.props.location;
    const { showExpired } = this.state;
    return (<p>
      Popular searches:
      {filters.map(filter => <Button to={`/sessions${filter.search}`} style={search === filter.search ? 'live' : false}>{filter.name}</Button>)}
      <Checkbox checked={showExpired} onChange={() => this.setState({ showExpired: !showExpired })} label="Show expired sessions" />
    </p>);
  }
  render() {
    const { params } = this.props;
    const { isLoading, showExpired } = this.state;
    let sessions = this.context.store.getState().get('sessionList');
    if (!showExpired) sessions = sessions.filter(session => session.sortedSchedule.length && (new Date(session.sortedSchedule[session.sortedSchedule.length - 1].start)).getTime() > Date.now());
    const limit = 10;
    const total = sessions ? sessions.length : 0;
    const page = (params && params.page) ? parseInt(params.page, 10) : 1;
    const maxPage = Math.ceil(total / limit);
    const [start, end] = [-1, 0].map(index => page + index).map(index => index * limit);
    return (<div className={styles.list}>
      {this.renderFilters()}
      {total ? (<div>
        {this.renderPagination(page, start, end, maxPage)}
        {isLoading ? <LoadingMessage message="Loading sessions" ellipsis /> : <SessionList heading={<p>Here is a list of all published sessions:</p>} sessions={sessions ? sessions.slice(start, end) : []} />}
        {this.renderPagination(page, start, end, maxPage)}
      </div>) : <p>No sessions {this.props.location.search ? 'for this search' : null}</p>}
    </div>);
  }
}
