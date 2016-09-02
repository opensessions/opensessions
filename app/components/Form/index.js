import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import styles from './styles.css';
import fieldStyles from '../Field/styles.css';
import appStyles from 'containers/App/styles.css';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node.isRequired,
    tab: PropTypes.any,
    pendingSteps: PropTypes.any,
    onPublish: PropTypes.func,
    fieldsets: PropTypes.array,
    status: PropTypes.string,
    saveState: PropTypes.string
  }
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.tab || props.fieldsets[0].slug,
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
    if (nextProps.tab) {
      this.setState({ activeTab: nextProps.tab });
    } else if (nextProps.fieldsets) {
      this.setState({ activeTab: nextProps.fieldsets[0].slug });
    }
  }
  componentDidUpdate(oldProps, oldState) {
    if (oldState.activeTab !== this.state.activeTab) {
      this.refocus();
    }
  }
  onFocus = () => {
    this.setState({ hasFocus: true });
  }
  onBlur = () => {
    this.setState({ hasFocus: false });
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
  handlePublish = event => {
    const { type, target, keyCode } = event;
    if (type === 'click' || (type === 'keyup' && keyCode === 13)) this.props.onPublish();
  }
  refocus = () => {
    try {
      const firstShownField = Array.filter(this.refs.form.elements, element => element.tagName === 'FIELDSET')
        .filter(fieldset => fieldset.parentNode.className !== styles.hiddenTab)[0].getElementsByClassName(fieldStyles.field)[0];
      const appBody = document.getElementsByClassName(appStyles.appBody)[0];
      const originalScrollTop = appBody.scrollTop;
      const interval = setInterval(() => {
        appBody.scrollTop -= 16 * (((((appBody.scrollTop / originalScrollTop) - .5) * 2) ** 3) + 1);
        if (appBody.scrollTop === 0) {
          firstShownField.querySelectorAll('[tabIndex], input, textarea, select')[0].focus();
          clearInterval(interval);
        }
      }, 16);
    } catch (error) {
      console.error('Couldn\'t refocus', error);
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
      let isComplete = <span className={styles.tickNone}>+</span>;
      if (validity === true) isComplete = <span className={styles.tick}><img role="presentation" src="/images/tick.svg" /></span>;
      else if (validity === 'none') isComplete = null;
      return [heading ? <h1 key={heading}>{heading}</h1> : null, <Link className={className} to={this.getSlugURL(slug)} key={key}>{label} {isComplete}</Link>];
    });
  }
  renderTab() {
    const { fieldsets } = this.props;
    const { activeTab } = this.state;
    return this.getFieldsets().map((child, key) => {
      const propFieldset = fieldsets[key];
      const { slug } = propFieldset;
      return <div key={key} className={styles[slug === activeTab ? 'activeTab' : 'hiddenTab']}>{child}</div>;
    });
  }
  renderActionButtons() {
    const slugs = this.getSlugs();
    return (<div className={styles.actionButtons}>
      {slugs[1] ? <Link to={this.getSlugURL(slugs[1])}>Next</Link> : <a onKeyUp={this.handlePublish} onClick={this.handlePublish} tabIndex="0">Publish</a>}
      {slugs[-1] ? <Link className={styles.backButton} to={this.getSlugURL(slugs[-1])}>Back</Link> : null}
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
