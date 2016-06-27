import React from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';

import { Link } from 'react-router';
import Authenticated from 'components/Authenticated';

import styles from '../SessionForm/styles.css';

import { apiFetch } from '../../utils/api';

export default class OrganizerForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: React.PropTypes.object,
    sessionID: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = { session: props.session || {} };
    this.updateSession = this.updateSession.bind(this);
  }
  componentDidMount() {
    const self = this;
    let sessionUri = '/api/session/create';
    if (this.props.session) {
      sessionUri = `/api/session/${this.props.session.uuid}`;
    } else if (this.props.sessionID) {
      sessionUri = `/api/session/${this.props.sessionID}`;
    }
    apiFetch(sessionUri).then((session) => {
      self.setState({ session });
    });
  }
  getSession() {
    const session = this.state.session || {};
    session.update = this.updateSession;
    return session;
  }
  updateSession(name, value) {
    const session = this.getSession();
    session[name] = value;
    this.setState({ session });
  }
  render() {
    const session = this.getSession();
    return (
      <div className={styles.form}>
        <Authenticated message="You must login before you can add a session">
          <div className={styles.titleBar}>
            <div className={styles.titleInner}>
              <div>
                <h2>Edit organization</h2>
                <h3>{session.title || <i>Untitled</i>}</h3>
              </div>
              <Link to={`/session/${session.uuid}`} className={styles.previewButton}>Preview</Link>
            </div>
          </div>
          <div className={styles.formBody}>
            <Form autosave model={session}>
              <Fieldset label="Info">
                <Field label="What to bring" name="name" model={session} />
              </Fieldset>
            </Form>
          </div>
        </Authenticated>
      </div>
    );
  }
}
