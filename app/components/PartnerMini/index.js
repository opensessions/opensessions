import React, { PropTypes } from 'react';

import Button from '../../components/Button';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class PartnerMini extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    partner: PropTypes.object.isRequried
  };
  static contextTypes = {
    onExpire: PropTypes.func
  }
  canAct(action) {
    return this.props.partner.actions.indexOf(action) !== -1;
  }
  render() {
    const { partner } = this.props;
    const { userId, data } = partner;
    return (<div className={styles.partner}>
      <img src={data ? data.picture : '/images/placeholder.png'} role="presentation" />
      Partner: {data && data.name ? data.name : userId}
      {this.canAct('delete') ? <Button onClick={() => apiModel.delete('partner', partner.uuid).then(() => this.context.onExpire())}>Delete</Button> : null}
      <Button onClick={() => (window.location = `/api/partner/${partner.uuid}/action/rdpe`)}>RDPE</Button>
    </div>);
  }
}
