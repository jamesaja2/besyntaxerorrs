import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import routes from './routes/index.js';
import { env } from './config/env.js';

const app = express();

const allowedOrigins = env.ALLOW_ORIGINS?.split(',').map((origin) => origin.trim()) ?? ['http://localhost:5173'];

const DEFAULT_SENTRY_DSN = 'https://e09c29bb2b4c4e4b032e4605d01aa964@o4510205690314752.ingest.de.sentry.io/4510205691887696';
const resolvedSentryDsn = env.SENTRY_DSN === '' ? undefined : env.SENTRY_DSN ?? DEFAULT_SENTRY_DSN;

if (resolvedSentryDsn) {
  Sentry.init({
    dsn: resolvedSentryDsn,
    environment: env.NODE_ENV,
    sendDefaultPii: true,
    integrations: [Sentry.expressIntegration()]
  });
}

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', routes);

if (resolvedSentryDsn) {
  Sentry.setupExpressErrorHandler(app);
}

app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
