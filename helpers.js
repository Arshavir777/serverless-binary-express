const AWS = require('aws-sdk');
const sharp = require('sharp');
const mailer = require('./mailer.js');
const fs = require('fs');
const multipart = require('parse-multipart');

AWS.config.update({ accessKeyId: process.env.AWS_API_KEY, secretAccessKey: process.env.AWS_API_SECRET });
const s3 = new AWS.S3();

const imageWidth = parseInt(process.env.IMAGE_WIDTH);
const imageHeight = parseInt(process.env.IMAGE_HEIGHT);
const bucket = process.env.AWS_BUCKET;

const storeFile = async ({ filePath, contentType, filename }) => {
    try {

        const inputBuffer = fs.readFileSync(filePath);
   

        const params = {
            Key: `resized/${filename}`,
            ContentType: contentType,
            ContentEncoding: 'binary',
            ACL: 'public-read',
            Body: inputBuffer
        };


        // Store image into a s3 incoming folder.
        await s3.putObject(params).promise();

        // Resize input image.
        const resizedImage = await sharp(inputBuffer)
            .resize(imageWidth, imageHeight, { fit: 'fill' })
            .toBuffer()

        // Store resized image into a s3 resized folder.
        const result = await s3.putObject({
            Bucket: bucket,
            ContentType: contentType,
            ContentEncoding: 'base64',
            Key: `resized/${filename}`,
            Body: resizedImage,
        }).promise()

        // todo
        // Sent mail.
        // await mailer.sendMail();

        return result;

    } catch (e) {
        console.log(e)
        return e
    }
};

module.exports = {
    storeFile
};