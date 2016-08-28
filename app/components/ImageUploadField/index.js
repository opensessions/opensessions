import React, { PropTypes } from 'react';
import { apiModel } from 'utils/api';

import styles from './styles.css';

export default class ImageUploadField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    upload: PropTypes.object,
    addText: PropTypes.string,
    preview: PropTypes.bool
  }
  handleChange = event => {
    event.stopPropagation();
    event.preventDefault();
    const { files } = event.target;
    const file = files[0];
    if (file) {
      const { upload, onChange } = this.props;
      const formData = new FormData();
      formData.append(upload.name, file, file.name);
      this.setState({ status: 'Uploading...' });
      apiModel.upload(upload.URL, formData).then(data => {
        this.setState({ status: '' });
        const { instance } = data;
        onChange(instance.image);
      }).catch(error => {
        let status = 'Failed to upload image';
        if (error.status === 413) status = 'Failed to upload image (file too large)';
        this.setState({ status });
        console.error(error);
      });
    }
  }
  render() {
    const { value, preview, addText } = this.props;
    return (<div className={`${styles.imageField} ${this.state && this.state.status === 'Uploading...' ? styles.loading : ''}`}>
      {preview ? <img src={value ? `${value}?${Date.now()}` : '/images/placeholder.png'} role="presentation" className={styles.preview} /> : null}
      <label className={styles.choose}><img src="/images/camera.png" role="presentation" /> <span className={styles.text}>{addText || 'Add photo'}</span> <input type="file" onChange={this.handleChange} /></label>
      <span className={styles.status}>{this.state ? this.state.status : ''}</span>
    </div>);
  }
}
