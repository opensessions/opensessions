import React, { PropTypes } from 'react';
import { apiModel } from 'utils/api';

import styles from './styles.css';

export default class ImageUploadField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func
  };
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    upload: PropTypes.object,
    addText: PropTypes.string,
    editText: PropTypes.string,
    preview: PropTypes.bool
  }
  constructor() {
    super();
    this.state = { isUploading: false };
  }
  reset = () => {
    this.props.onChange('');
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
      this.setState({ isUploading: true });
      apiModel.upload(upload.URL, formData).then(data => {
        this.setState({ isUploading: false });
        const { instance } = data;
        onChange(instance[upload.name]);
      }).catch(error => {
        this.setState({ isUploading: false });
        this.context.notify(`Failed to upload image ${error.status === 413 ? '(file too large)' : ''}`, 'error');
        console.error(error);
      });
    }
  }
  render() {
    const { value, preview, addText, editText } = this.props;
    const { isUploading } = this.state;
    const uploadText = value ? editText || 'Change photo' : addText || 'Add photo';
    return (<div className={[styles.imageField, isUploading ? styles.loading : null].join(' ')}>
      {preview ? <img src={value ? `${value}?${Date.now()}` : '/images/placeholder.png'} role="presentation" className={styles.preview} /> : null}
      <div className={styles.buttons}>
        {value ? <label className={styles.choose} onClick={this.reset}><img src="/images/remove.png" role="presentation" /> <span className={styles.text}>Remove photo</span></label> : null}
        <label className={styles.choose}>
          <img src={value ? '/images/change.png' : '/images/camera.png'} role="presentation" />
          <span className={styles.text}>{isUploading ? 'Uploading...' : uploadText}</span>
          <input type="file" onChange={this.handleChange} />
        </label>
      </div>
    </div>);
  }
}
