import http from 'http';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import boom from 'express-boom';

import v1 from './v1';
import config from './config/environment';
import initializeDb from './db';

const app = express();
app.server = http.createServer(app);

app.use(boom());
app.use(compression());
app.use(cors(config.cors));
app.use(helmet());

app.use(bodyParser.json({
  limit: config.body.limit,
}));

app.use(bodyParser.urlencoded({
  limit: config.body.limit,
  extended: true,
}));

initializeDb()
.then(() => {
  app.use('/v1', v1(app));

  app.use('*', (req, res) => {
    res.boom.notFound();
  });

  app.server.listen(config.env.port);

  // eslint-disable-next-line
  console.log(`Started on port ${config.env.port}`);
});

process.on('SIGINT', () => {
  app.server.close(() => {
    process.exit();
  });

  process.exit(0);
});

export default app;
