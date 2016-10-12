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
  onDragOver = event => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.setState({ isDragging: true });
  }
  onDragLeave = () => {
    this.setState({ isDragging: false });
  }
  onDrop = e => {
    e.stopPropagation();
    e.preventDefault();
    const { files } = e.dataTransfer;
    Array.filter(files, file => file.type.match(/image.*/)).forEach(file => this.uploadFile(file));
    this.setState({ isDragging: false });
  }
  uploadFile = file => {
    const { upload, onChange } = this.props;
    const formData = new FormData();
    formData.append(upload.name, file, file.name);
    this.setState({ isUploading: true });
    apiModel.upload(upload.URL, formData).then(data => {
      this.setState({ isUploading: false, modified: Date.now() });
      const { instance } = data;
      onChange(instance[upload.name]);
    }).catch(error => {
      this.setState({ isUploading: false });
      this.context.notify(`Failed to upload image ${error.status === 413 ? '(file too large)' : ''}`, 'error');
      console.error(error);
    });
  }
  reset = () => {
    this.props.onChange('');
  }
  handleChange = event => {
    event.stopPropagation();
    event.preventDefault();
    const { files } = event.target;
    const file = files[0];
    if (file) this.uploadFile(file);
  }
  render() {
    const { value, preview, addText, editText } = this.props;
    const { isUploading, isDragging, modified } = this.state;
    let uploadText = value ? editText || 'Change photo' : addText || 'Add photo';
    uploadText = isDragging ? 'Drop to upload' : uploadText;
    const buttons = [
      { key: 'add', text: isUploading ? 'Uploading...' : uploadText, icon: <img src={value ? '/images/change.png' : '/images/camera.png'} role="presentation" />, input: <input type="file" onChange={this.handleChange} /> }
    ];
    if (value && !isDragging) buttons.unshift({ key: 'remove', text: 'Remove photo', icon: <img src="/images/remove.png" role="presentation" />, onClick: this.reset });
    return (<div className={[styles.imageField, isUploading ? styles.loading : null].join(' ')} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}>
      {preview ? <img src={value ? `${value}?${modified || ''}` : '/images/placeholder.png'} role="presentation" className={styles.preview} /> : null}
      <div className={styles.buttons}>
        {buttons.map(button => (<label className={styles.choose} onClick={button.onClick} key={button.key}>
          {button.icon} <span className={styles.text}>{button.text}</span> {button.input || null}
        </label>))}
      </div>
    </div>);
  }
}
