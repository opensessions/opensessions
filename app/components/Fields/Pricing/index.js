import React, { PropTypes } from 'react';

import IconRadio from '../IconRadio';
import TextField from '../Text';
import PriceField from '../Price';
import Checkbox from '../Checkbox';
import JSONList from '../JSONList';
import PriceSVG from '../../SVGs/Price';
import PaymentMethodSVG from '../../SVGs/PaymentMethod';
import FeatureModal from '../../../containers/Modals/Feature';

import styles from './styles.css';

const PAYMENT_OPTIONS = [
  { text: 'FREE', value: 'free', icon: <PriceSVG free /> },
  { text: 'PAID', value: 'paid', icon: <PriceSVG /> }
];

const METHODS_OPTIONS = [
  { text: 'Cash only', value: 'cash', icon: <PaymentMethodSVG cash /> },
  { text: 'Cash or card', value: 'cash,card', icon: <PaymentMethodSVG card cash /> },
  { text: 'Card only', value: 'card', icon: <PaymentMethodSVG card /> }
];

export default class PricingField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func
  };
  static contextTypes = {
    notify: PropTypes.func,
    modal: PropTypes.object
  }
  setFree = () => {
    const { value, onChange } = this.props;
    if (!value || value.type !== 'free') onChange({ type: 'free' });
  }
  setPaid = () => {
    const { value, onChange } = this.props;
    if (!value || value.type !== 'paid') onChange({ type: 'paid', prices: [{}] });
  }
  setPaidMulti = () => {
    const { value } = this.props;
    const { prices } = value;
    value.type = 'multi';
    value.prices = (prices && prices.length) ? prices : [{}];
    this.props.onChange(value);
  }
  setPaidSimple = () => {
    const { value } = this.props;
    value.type = 'paid';
    value.prices = value.prices.concat({ price: '' }).slice(0, 1);
    this.props.onChange(value);
  }
  setMethod = methods => {
    const { value, onChange } = this.props;
    value.paymentMethods = methods;
    onChange(value);
  }
  setPrices = prices => {
    const { value, onChange } = this.props;
    value.prices = prices;
    onChange(value);
  }
  setFirstFree = firstFree => {
    const { value, onChange } = this.props;
    value.firstFree = firstFree;
    onChange(value);
  }
  changePrice = price => {
    const { value, onChange } = this.props;
    value.prices[0].price = price;
    onChange(value);
  }
  renderFree() {
    return (<div className={styles.isFree}>
      <p><span className={styles.freeIcon}><img src="/images/tick.svg" role="presentation" /></span> Your session is free to attend</p>
    </div>);
  }
  renderPaid() {
    const { value } = this.props;
    return (<ol className={styles.questions}>
      <li>
        {value.type === 'multi' ? this.renderPrices() : this.renderPrice()}
      </li>
      <li className={styles.bind}>
        <label>What payment methods do you accept?</label>
        <IconRadio value={value.paymentMethods} options={METHODS_OPTIONS} onChange={this.setMethod} />
      </li>
      <li>
        <label>Offer the first session for free?</label>
        <div className={styles.firstFree}>
          <Checkbox checked={value.firstFree} onChange={checked => this.setFirstFree(checked)} label="Yes, first time attendees get a free session" />
        </div>
      </li>
    </ol>);
  }
  renderPrice() {
    const { value } = this.props;
    return (<div>
      <label>How much does this session cost?</label>
      <div><PriceField value={value.prices[0] ? value.prices[0].price : ''} onChange={this.changePrice} /></div>
      <div className={styles.changeType}><a onClick={this.setPaidMulti}>More than one price?</a></div>
    </div>);
  }
  renderPrices() {
    const { value } = this.props;
    return (<div>
      <div><JSONList
        value={value.prices}
        onChange={this.setPrices}
        onAddEmpty={() => ({})}
        addText="Add attendee type"
        components={[
          { label: 'Type of attendee', Component: TextField, props: { name: 'type', size: 'S', placeholder: 'E.g. Adults / concessions' } },
          { label: 'Price', Component: PriceField, props: { name: 'price' } }
        ]}
      /></div>
      <div className={styles.changeType}><a onClick={this.setPaidSimple}>Wait! My session has one simple price for everybody</a></div>
    </div>);
  }
  render() {
    const { value } = this.props;
    const isPaid = value && ['paid', 'multi'].indexOf(value.type) !== -1;
    return (<div className={styles.field}>
      <div className={styles.isPaid}><IconRadio options={PAYMENT_OPTIONS} onChange={val => (val === 'free' ? this.setFree() : this.setPaid())} value={isPaid ? 'paid' : 'free'} inline /></div>
      {isPaid ? this.renderPaid() : this.renderFree()}
      <div className={styles.notice}>
        <span className={styles.iconAlert}>!</span>
        <div className={styles.noticeText}>
          <h2><strong>Please note:</strong> attendees will be able to turn up at your session without reserving a spot</h2>
          <p><a onClick={() => this.context.modal.dispatch({ component: <FeatureModal feature="Booking & attendee list" /> })}>Need to know who's coming?</a></p>
        </div>
      </div>
    </div>);
  }
}
