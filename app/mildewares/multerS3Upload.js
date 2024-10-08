const AWS = require('aws-sdk');
const { s3Bucket } = require('../../config');
AWS.config.update({ accessKeyId: s3Bucket.ACCESS_KEY_ID, secretAccessKey: s3Bucket.SECRET_ACCESS_KEY });
const AWS_S3 = new AWS.S3();
const multer = require('multer');
const multerS3 = require('multer-s3');

// Set up multer-s3 to upload files to the S3 bucket
const upload = multer({
    storage: multerS3({
        s3: AWS_S3,
        bucket: s3Bucket.BUCKET_NAME,
        acl: 'public-read', // Allows public read access to the images
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname); // Unique filename
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;