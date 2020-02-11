const express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const multiparty = require('multiparty');
const app = new express();
const fs = require('fs');

const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_API_KEY, secretAccessKey: process.env.AWS_API_SECRET });
const s3 = new AWS.S3();
const sharp = require('sharp');

const imageWidth = parseInt(process.env.IMAGE_WIDTH);
const imageHeight = parseInt(process.env.IMAGE_HEIGHT);
const bucket = process.env.AWS_BUCKET;
// app.use(awsServerlessExpressMiddleware.eventContext());

// Test Heartbeat 
app.get('/test', (req, res) => {
    res.send("TESTING");
});

app.post("/upload", async (req, res) => {

    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {

        var myFile = files.file[0];
        var fileInputBuffer = fs.readFileSync(myFile.path);

        s3.putObject({
            Bucket: bucket,
            Key: `incoming/${myFile.originalFilename}`,
            ContentType: myFile.headers['content-type'],
            ContentEncoding: 'binary',
            ACL: 'public-read',
            Body: fileInputBuffer
        }).promise()
            .then(() => {
                sharp(fileInputBuffer)
                    .resize(imageHeight, imageWidth, { fit: 'fill' })
                    .toBuffer()
                    .then(buffer => {
                        s3.putObject({
                            Bucket: bucket,
                            Key: `resized/${myFile.originalFilename}`,
                            ContentType: myFile.headers['content-type'],
                            ContentEncoding: 'binary',
                            ACL: 'public-read',
                            Body: buffer
                        }).promise()
                            .then(() => {
                                res.status(200).json({
                                    success: true,
                                    message: 'Image successfully resized and saved.'
                                }).end()
                            })
                    })
                    .catch(error => {
                        res.status(500).json({
                            error,
                            message: "Sharp resizing error"
                        }).end()
                    })
            })
            .catch(error => {
                res.status(500).json(error).end()
            });
    })
})

module.exports = app;
