import React, { PropTypes } from 'react';

import styles from './styles.css';
import fieldStyles from '../Field/styles.css';
import appStyles from 'containers/App/styles.css';

import trackPage from '../../utils/analytics';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node.isRequired,
    model: PropTypes.object,
    pendingSteps: PropTypes.any,
    onPublish: PropTypes.func,
    fieldsets: PropTypes.array,
    status: PropTypes.string,
    saveState: PropTypes.string
  }
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      saveState: 'Unsaved',
      hasFocus: false
    };
  }
  componentDidMount() {
    this.refocus();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.status !== this.props.status) {
      if (nextProps.status) this.setState({ saveState: nextProps.status, saveStateClass: styles.error });
      else this.setState({ saveState: 'Saving...', saveStateClass: styles.saving });
    }
  }
  componentDidUpdate(oldProps, oldState) {
    if (oldState.activeTab !== this.state.activeTab) {
      this.refocus();
      const fieldset = this.props.fieldsets[this.state.activeTab];
      trackPage(`${document.location.href}#${fieldset.slug}`, `${document.location.pathname}#${fieldset.slug}`);
    }
  }
  onFocus = () => {
    this.setState({ hasFocus: true });
  }
  onBlur = () => {
    this.setState({ hasFocus: false });
  }
  getFieldsets() {
    return this.props.children instanceof Array ? this.props.children : [this.props.children];
  }
  tabClick = (event) => {
    const key = parseInt(event.target.dataset.key, 10);
    this.setState({ activeTab: key });
  }
  actionClick = (event) => {
    const { type, target, keyCode } = event;
    if (type === 'keypress' && keyCode !== 13) return;
    const delta = target.text === 'Next' ? 1 : -1;
    this.setState({ activeTab: this.state.activeTab + delta });
  }
  refocus = () => {
    try {
      const firstShownField = Array.filter(this.refs.form.elements, (element) => element.tagName === 'FIELDSET')
        .filter((fieldset) => fieldset.parentNode.className !== styles.hiddenTab)[0].getElementsByClassName(fieldStyles.field)[0];
      firstShownField.querySelectorAll('input, textarea, select')[0].focus();
      document.getElementsByClassName(appStyles.appBody)[0].scrollTop = 0;
    } catch (error) {
      console.error('Couldn\'t refocus', error);
    }
  }
  renderNav() {
    return this.getFieldsets().map((fieldset, key) => {
      const { heading, validity, label } = fieldset.props;
      const className = this.state.activeTab === key ? styles.active : '';
      let isComplete = <span className={styles.tickNone}>+</span>;
      if (validity === true) isComplete = <span className={styles.tick}><img role="presentation" src="/images/tick.svg" /></span>;
      else if (validity === 'none') isComplete = null;
      return [heading ? <h1>{heading}</h1> : null, <a className={className} onClick={this.tabClick} key={key} data-key={key}>{label} {isComplete}</a>];
    });
  }
  renderTab() {
    return this.getFieldsets().map((child, key) => {
      const active = key === this.state.activeTab ? '' : styles.hiddenTab;
      return <div key={key} className={active}>{child}</div>;
    });
  }
  renderActionButtons() {
    const { inactive } = styles;
    const backAttr = {
      onClick: this.actionClick,
      onKeyPress: this.actionClick,
      className: styles.backButton,
      tabIndex: 0
    };
    const nextAttr = {
      onClick: this.actionClick,
      onKeyPress: this.actionClick,
      tabIndex: 0
    };
    let nextText = 'Next';
    if (this.state.activeTab === 0) {
      backAttr.className = `${styles.backButton} ${inactive}`;
      backAttr.onClick = undefined;
    } else if (this.state.activeTab + 1 === this.props.children.length) {
      nextAttr.onClick = this.props.onPublish;
      nextText = 'Publish';
    }
    return (<div className={styles.actionButtons}>
      <a {...backAttr}>Back</a>
      <a {...nextAttr}>{nextText}</a>
    </div>);
  }
  render() {
    const { pendingSteps } = this.props;
    return (<form onFocus={this.onFocus} onBlur={this.onBlur} className={styles.form} data-hasFocus={this.state.hasFocus} ref="form">
      <nav className={styles.nav}>
        {this.renderNav()}
        <div className={styles.pending} dangerouslySetInnerHTML={{ __html: pendingSteps ? `Complete <b>${pendingSteps} more</b> step${pendingSteps === 1 ? '' : 's'} to finish your listing` : 'Ready to publish!' }} />
      </nav>
      <div className={styles.tabs}>
        <div className={`${styles.saveState} ${styles[this.props.saveState || 'unsaved']}`}>{this.state.saveState}</div>
        {this.renderTab()}
        <nav className={styles.formNav}>
          {this.renderActionButtons()}
        </nav>
      </div>
    </form>);
  }
}
