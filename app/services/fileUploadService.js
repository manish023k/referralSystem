const AWS = require('aws-sdk');
const { s3Bucket } = require('../../config');
AWS.config.update({ accessKeyId: s3Bucket.ACCESS_KEY_ID, secretAccessKey: s3Bucket.SECRET_ACCESS_KEY });
const AWS_S3 = new AWS.S3();
const multer = require('multer');
const multerS3 = require('multer-s3');

let fileUploadService = {};
/**
 * function to upload a file to s3(AWS) bucket.
 */
fileUploadService.uploadFileToS3 = (buffer, fileName, bucketName) => {
    return new Promise((resolve, reject) => {
        AWS_S3.upload({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer
        }, function (err, data) {
            if (err) {
                console.log('Error here', err);
                return reject(err);
            }
            let imageUrl = `${s3Bucket.CLOUD_FRONT_URL}/${data.key}`;
            resolve(imageUrl);
        });
    });
};

fileUploadService.uploadFilesToS3 = async (file) => {
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
    return upload;
}

module.exports = fileUploadService;