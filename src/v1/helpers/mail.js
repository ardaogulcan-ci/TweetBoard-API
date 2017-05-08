import nodemailer from 'nodemailer';
import config from '../../config/environment';

let transporter;

if (process.env.TYPE === 'development') {
  transporter = nodemailer.createTransport({
    port: 1025,
    tls: {
      rejectUnauthorized: false,
    },
  });
} else {
  transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail',
  });
}

export default function notifyBoardMail(to, link) {
  const fullPath = config.client.url + link;
  transporter.sendMail({
    from: 'TweetBoard <tweetboard@ardaogulcan.com>',
    to,
    subject: 'A Board has been shared with you',
    html: `<p>Here your custom link for the board</p><a href="${fullPath}">${fullPath}</a>`,
  });
}
