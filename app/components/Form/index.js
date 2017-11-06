import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import NotificationBar from '../NotificationBar';
import FieldsetStatusSVG from '../SVGs/FieldsetStatus';
import GenericForm from '../GenericForm';
import Button from '../Button';

import styles from './styles.css';
import fieldStyles from '../Field/styles.css';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node.isRequired,
    tab: PropTypes.any,
    activeField: PropTypes.any,
    pendingSteps: PropTypes.any,
    onPublish: PropTypes.func,
    fieldsets: PropTypes.array,
    status: PropTypes.string,
    saveState: PropTypes.string,
    readyText: PropTypes.string
  };
  static contextTypes = {
    store: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      saveState: 'Unsaved'
    };
  }
  componentDidMount() {
    this.refocus();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.status !== this.props.status) {
      if (nextProps.status) this.setState({ saveState: nextProps.status });
      else this.setState({ saveState: 'Saving...' });
    }
    if (nextProps.tab) {
      this.setState({ activeTab: nextProps.tab });
    } else if (nextProps.fieldsets) {
      this.setState({ activeTab: nextProps.fieldsets[0].slug });
    }
  }
  componentDidUpdate(oldProps, oldState) {
    if (oldState.activeTab !== this.state.activeTab || oldProps.activeField !== this.props.activeField) {
      this.refocus();
    }
  }
  getSlugs = () => {
    const slugs = this.props.fieldsets.map(fieldset => fieldset.slug);
    const { activeTab } = this.state;
    return { '-1': slugs.find((slug, key) => slugs[key + 1] === activeTab), 0: activeTab, 1: slugs.find((slug, key) => slugs[key - 1] === activeTab) };
  }
  getSlugURL = slug => {
    const { pathname } = window.location;
    return [pathname.match(/^.*edit/) ? pathname.match(/^.*edit/)[0] : pathname, slug].join('/');
  }
  getFieldsets() {
    return this.props.children instanceof Array ? this.props.children : [this.props.children];
  }
  getFocusIndex = () => {
    const index = this.context.store.getState().get('formFocusIndex');
    return index || 0;
  }
  handlePublish = event => {
    const { type, keyCode } = event;
    if (type === 'click' || (type === 'keyup' && keyCode === 13)) this.props.onPublish();
  }
  refocus = () => {
    try {
      const fields = Array.filter(
        this.refs.form.querySelectorAll('fieldset'),
        e => e.parentNode.className.search(styles.hiddenTab) === -1
      )[0].getElementsByClassName(fieldStyles.field);
      const { activeField } = this.props;
      const fieldToFocus =
        activeField
        ? Array.find(fields, field => field.getElementsByTagName('label')[0].textContent.match(new RegExp(activeField, 'i')))
        : fields[Math.min(this.getFocusIndex(), fields.length - 1)];
      window.requestAnimationFrame(() => {
        fieldToFocus.querySelectorAll('[tabIndex], input, textarea, select')[0].focus();
      });
    } catch (error) {
      // this exception is raised when the field to be focused is overridden (non editable)
      window.logException('Couldn\'t refocus', error);
    }
  }
  renderNav() {
    const { fieldsets } = this.props;
    const { activeTab } = this.state;
    return this.getFieldsets().map((fieldset, key) => {
      const { heading, validity, label } = fieldset.props;
      const propFieldset = fieldsets[key];
      const { slug } = propFieldset;
      const className = activeTab === slug ? styles.active : '';
      let isComplete = <span className={styles.tickNone}><FieldsetStatusSVG /></span>;
      if (validity === true) isComplete = <span className={styles.tick}><img role="presentation" src="/images/tick.svg" /></span>;
      else if (validity === 'none') isComplete = null;
      return [heading ? <h1 key={heading}>{heading}</h1> : null, <Link className={className} to={this.getSlugURL(slug)} key={key}>{label} {isComplete}</Link>];
    });
  }
  renderTab() {
    const { fieldsets } = this.props;
    const { activeTab } = this.state;
    return this.getFieldsets().map((child, key) => {
      const { slug } = fieldsets[key];
      if (slug === activeTab) return <div key={key}>{child}</div>;
      return null;
    });
  }
  renderActionButtons() {
    const slugs = this.getSlugs();
    return (<div className={styles.actionButtons}>
      {slugs[1] ? <Button to={this.getSlugURL(slugs[1])}>Next</Button> : <Button onClick={this.props.onPublish}>Publish</Button>}
      {slugs[-1] ? <Button className={styles.backButton} to={this.getSlugURL(slugs[-1])}>Back</Button> : null}
    </div>);
  }
  render() {
    const { saveState, pendingSteps, readyText } = this.props;
    return (<GenericForm>
      <form ref="form" className={styles.form}>
        <NotificationBar />
        <nav className={styles.nav}>
          <div className={styles.navLinks}>
            {this.renderNav()}
          </div>
          {readyText ? <div className={styles.pending}>{pendingSteps ? <p>Complete <b>{`${pendingSteps} more`}</b> step{pendingSteps > 1 ? 's' : ''} to finish your listing</p> : readyText}</div> : null}
        </nav>
        <div className={styles.tabs}>
          <div className={[styles.saveState, styles[saveState || 'unsaved']].join(' ')}>{this.state.saveState}</div>
          {this.renderTab()}
          <nav className={styles.formNav}>
            {this.renderActionButtons()}
          </nav>
        </div>
      </form>
    </GenericForm>);
  }
}
