import React, { PropTypes } from 'react';

import ItemMap from '../ItemMap';

import SessionTileView from '../../containers/SessionTileView';

export default class SessionMap extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    store: PropTypes.object
  };
  static propTypes = {
    location: PropTypes.object,
    sessions: PropTypes.array,
    size: PropTypes.number,
    hasSidebar: PropTypes.bool
  }
  isActive(session) {
    return session.schedule && session.schedule.some(slot => (new Date([slot.startDate, slot.startTime].join('T'))).getTime() > Date.now());
  }
  render() {
    const storeState = this.context.store.getState();
    const sessions = this.props.sessions || storeState.get('sessionList');
    return <ItemMap {...this.props} markers={sessions.filter(s => s.locationData && s.locationData.lat).map(s => ({ ...s.locationData, isActive: this.isActive(s), box: () => <SessionTileView session={s} style="slim" /> }))} />;
  }
}
