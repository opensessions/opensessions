import React, { PropTypes } from 'react';

import LoadingMessage from '../../components/LoadingMessage';
import SessionList from '../SessionList';
import Button from '../../components/Button';
import Checkbox from '../../components/Fields/Checkbox';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

const toDate = date => date.toISOString().substr(0, 10);

export default class ListSessions extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object,
    router: PropTypes.object
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
      {page > 1 ? <Button to={`/sessions${this.props.location.search}`} style="slim">Start</Button> : null}
      {page > 1 ? <Button to={`/sessions/${page - 1}${this.props.location.search}`} style="slim">🠜</Button> : null}
      <span> Page {page} of {maxPage} </span>
      {page < maxPage ? <Button to={`/sessions/${page + 1}${this.props.location.search}`} style="slim">🠞</Button> : null}
      {page < maxPage ? <Button to={`/sessions/${maxPage}${this.props.location.search}`} style="slim">End</Button> : null}
    </div>);
  }
  renderFilters() {
    const now = new Date();
    const filters = [
      { search: '', name: 'All' },
      { search: `?updatedAt=${toDate(now)}`, name: 'Updated today' },
      { search: `?updatedAt=${toDate(new Date((new Date()).setDate(now.getDate() - 1)))}`, name: 'Updated yesterday' },
      { search: `?updatedAt=${toDate(new Date((new Date()).setDate(now.getDate() - 7)))}:${toDate(now)}`, name: 'Updated within last week' }
    ];
    const { search } = this.props.location;
    const { showExpired } = this.state;
    return (<div className={styles.filters}>
      <p>Filters - {filters.map(filter => <Button to={`/sessions${filter.search}`} style={search === filter.search ? 'live' : false}>{filter.name}</Button>)}</p>
      {filters.some(filter => filter.search === search) ? null : (<p>
        Current filters - {search.slice(1).split('&').map(v => v.split('=')).map(([key, val]) => {
          const changeVal = () => {
            const newVal = prompt(`Change ${key}:`, val);
            if (newVal) this.context.router.push(`/sessions${search.replace(`${key}=${val}`, `${key}=${newVal}`)}`);
          };
          return <span>{key}: <Button style={['slim', 'live']} onClick={() => changeVal()}>{val}</Button> <Button style={['slim', 'danger']} to={`/sessions${search.replace(new RegExp(`[\?&]?${key}=${val}`), '')}`}>x</Button></span>;
        })}
      </p>)}
      <p><Checkbox checked={showExpired} onChange={() => this.setState({ showExpired: !showExpired })} label="Show expired sessions" /></p>
    </div>);
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
        {isLoading ? null : this.renderPagination(page, start, end, maxPage)}
        {isLoading ? <LoadingMessage message="Loading sessions" ellipsis /> : <SessionList heading=" " sessions={sessions ? sessions.slice(start, end) : []} />}
        {isLoading ? null : this.renderPagination(page, start, end, maxPage)}
      </div>) : <p>No sessions {this.props.location.search ? 'for this search' : null}</p>}
    </div>);
  }
}
