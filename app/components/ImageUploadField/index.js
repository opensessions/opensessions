import React, { PropTypes } from 'react';
import { apiModel } from 'utils/api';

import styles from './styles.css';

export default class ImageUploadField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    uploadURL: PropTypes.string
  }
  handleChange = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const { files } = event.target;
    const file = files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file, file.name);
      this.setState({ status: 'Uploading...' });
      apiModel.upload(this.props.uploadURL, formData).then(data => {
        this.setState({ status: '' });
        const { instance } = data;
        if (this.props.onChange) this.props.onChange(instance.image);
      }).catch(error => {
        let status = 'Failed to upload image';
        if (error.status === 413) status = 'Failed to upload image (file too large)';
        this.setState({ status });
        console.error(error);
      });
    }
  }
  render() {
    const { value } = this.props;
    return (<div className={`${styles.imageField} ${this.state && this.state.status === 'Uploading...' ? styles.loading : ''}`}>
      <img src={value ? `${value}?${Date.now()}` : '/images/placeholder.png'} role="presentation" className={styles.preview} />
      <label className={styles.choose}><img src="/images/camera.png" role="presentation" /> <span className={styles.text}>Add photo</span> <input type="file" onChange={this.handleChange} /></label>
      <span className={styles.status}>{this.state ? this.state.status : ''}</span>
    </div>);
  }
}
