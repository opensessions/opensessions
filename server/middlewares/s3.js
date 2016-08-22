const Upload = require('s3-uploader');

module.exports = (aws, imagePath, desiredPath) => new Promise((resolve, reject) => {
  const client = new Upload(aws.URL, {
    aws: {
      region: 'eu-west-1',
      path: aws.path,
      acl: 'public-read',
      accessKeyId: aws.accessKeyId,
      secretAccessKey: aws.secretAccessKey,
      maxRetries: 4,
      maxRedirects: 4,
      httpOptions: {
        timeout: 4000
      }
    },
    versions: [{
      maxHeight: 1040,
      maxWidth: 1040,
      format: 'jpg',
      suffix: '-large',
      quality: 80,
      awsImageExpires: 31536000,
      awsImageMaxAge: 31536000
    }, {
      maxWidth: 720,
      aspect: '3:2!h',
      format: 'jpg',
      suffix: '-medium'
    }, {
      maxWidth: 250,
      aspect: '3:2!h',
      format: 'jpg',
      suffix: '-small'
    }]
  });
  client.upload(imagePath, { path: desiredPath }, (err, versions, meta) => {
    if (err) {
      console.log('aws error', err, versions, meta);
      reject(err);
    } else {
      resolve({ versions, meta });
    }
  });
});
