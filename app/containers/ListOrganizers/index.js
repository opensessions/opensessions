import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import LoadingMessage from '../../components/LoadingMessage';
import PagedList from '../../components/PagedList';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

const OrganizerTile = function (props) {
  const { organizer } = props;
  return (<div className={styles.organizerTile}>
    <span>
      {organizer.image ? <img src={organizer.image} role="presentation" className={styles.icon} /> : null}
      <Link to={organizer.href}>{organizer.name}</Link>
      {organizer.Sessions.length ? <span className={styles.nSessions}>{organizer.Sessions.length} sessions</span> : null}
    </span>
    <span className={styles.createdAt}>created {(new Date(organizer.createdAt)).toDateString()}</span>
  </div>);
};
OrganizerTile.propTypes = { organizer: PropTypes.object };

export default class ListOrganizers extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object
  };
  static propTypes = {
    params: PropTypes.object
  };
  static fetchData(dispatch) {
    return apiModel.search('organizer').then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'ORGANIZER_LIST_LOADED', payload: instances.sort((i1, i2) => (i1.createdAt > i2.createdAt ? 1 : -1)) });
    });
  }
  constructor() {
    super();
    this.state = { isLoading: false };
  }
  componentDidMount() {
    this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
    this.constructor.fetchData(this.context.store.dispatch).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
    });
  }
  render() {
    const { params } = this.props;
    const { isLoading } = this.state;
    const organizers = this.context.store.getState().get('organizerList') || [];
    const page = (params && params.page) ? parseInt(params.page, 10) : 1;
    return (<div className={styles.list}>
      {isLoading ? <LoadingMessage message="Loading organisers" ellipsis /> : <PagedList items={organizers} limit={100} page={page} Component={OrganizerTile} itemToProps={item => ({ organizer: item })} newUrl={p => `/organizers/${p}`} isSlim />}
    </div>);
  }
}
