import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { getSettings, loadSettings, subscribeSettings, type RuntimeSettings } from './services/settingsService.js';

dotenv.config({ path: '/home/jelastic/besyntaxerorrs/server/.env' });

const app = express();

await loadSettings();

let currentSentryDsn: string | null = null;

async function configureSentry(settings: RuntimeSettings) {
  const normalizedDsn = settings.sentryDsn?.trim() ?? null;

  if (normalizedDsn === currentSentryDsn) {
    return;
  }

  currentSentryDsn = normalizedDsn;

  if (normalizedDsn) {
    await Sentry.close().catch(() => undefined);
    Sentry.init({
      dsn: normalizedDsn,
      environment: env.NODE_ENV,
      sendDefaultPii: true,
      integrations: [Sentry.expressIntegration()]
    });
  } else {
    await Sentry.close().catch(() => undefined);
  }
}

await configureSentry(getSettings());

subscribeSettings(async (settings) => {
  await configureSentry(settings);
});

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const { allowedOrigins } = getSettings();
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', routes);

Sentry.setupExpressErrorHandler(app);

app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
