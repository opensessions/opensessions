import React, { PropTypes } from 'react';

import Sticky from 'components/Sticky';

import styles from './styles.css';

export default class PublishHeader extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    h2: PropTypes.node,
    h3: PropTypes.node,
    actions: PropTypes.array
  }
  renderActions() {
    const { actions } = this.props;
    return <div className={styles.actions}>{actions}</div>;
  }
  render() {
    const { h2, h3 } = this.props;
    return (<Sticky>
      <div className={styles.titleBar}>
        <div className={styles.titleInner}>
          <div>
            {h2 ? <h2>{h2}</h2> : null}
            {h3 ? <h3>{h3}</h3> : null}
          </div>
          {this.renderActions()}
        </div>
      </div>
    </Sticky>);
  }
}

