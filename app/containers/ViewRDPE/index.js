import React, { PropTypes } from 'react';

import Button from '../../components/Button';
import LoadingMessage from '../../components/LoadingMessage';
import JSONView from '../../components/JSONView';
import PublishHeader from '../../components/PublishHeader';

import { apiFetch } from '../../utils/api';

import styles from './styles.css';

export default class ViewRDPE extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    store: PropTypes.object,
    notify: PropTypes.func
  };
  static propTypes = {
    location: PropTypes.object
  }
  static fetchData(dispatch, props) {
    const { location } = props;
    return apiFetch(`/api/rdpe/sessions${location.search || ''}`)
      .then(rdpeResult => dispatch({ type: 'RDPE_LOADED', payload: rdpeResult }));
  }
  constructor() {
    super();
    this.state = { isLoading: false };
  }
  componentDidMount() {
    this.fetchData(this.props).catch(error => this.context.notify(error, 'error'));
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) this.fetchData(nextProps);
  }
  fetchData(props) {
    this.setState({ isLoading: true });
    return this.constructor.fetchData(this.context.store.dispatch, props).then(() => {
      this.setState({ isLoading: false });
    });
  }
  render() {
    const { isLoading } = this.state;
    const rdpe = this.context.store.getState().get('rdpe');
    let h3 = 'Loading RDPE';
    const actions = [];
    if (rdpe && rdpe.items) {
      if (!isLoading) h3 = `Showing ${rdpe.items.length} items`;
      if (this.props.location.search) actions.push(<Button key="reset" to="/rdpe" style="danger">Reset</Button>);
      actions.push(<Button key="raw" onClick={() => window.location.assign(`/api/rdpe/sessions?${this.props.location.search}`)}>Raw</Button>);
      actions.push(<Button key="next" to={`/rdpe?${rdpe.next.split('?')[1]}`}>Next</Button>);
    }
    return (<div>
      <PublishHeader h2="RDPE Viewer" h3={h3} actions={actions} />
      {isLoading
        ? <LoadingMessage message="Loading RDPE" />
        : (<ol className={styles.list}>
          {rdpe && rdpe.items ? rdpe.items.map((data, key) => <li key={key}><JSONView data={data} /></li>) : null}
        </ol>)}
    </div>);
  }
}
