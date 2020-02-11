const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2'
})
const name = 'Test User';

const htmlBody = `
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <p>Hi ${name},</p>
    <p>...</p>
  </body>
</html>
`;

const textBody = `
Hi ${name},
...
`;

const params = {
    Destination: {
        ToAddresses: [process.env.MAIL]
    },
    Message: {
        Body: {
            Html: {
                Charset: "UTF-8",
                Data: htmlBody
            },
            Text: {
                Charset: "UTF-8",
                Data: textBody
            }
        },
        Subject: {
            Charset: "UTF-8",
            Data: "Thanks for registering with ACME!"
        }
    },
    Source: "TEST from Kiwi-Science <admin@admin.com>"
};

module.exports.sendMail = function () {
    return new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail(params)
        .promise();
}
