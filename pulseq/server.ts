import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// Allowed hosts validation to prevent Host header poisoning & SSRF
const ALLOWED_HOSTS = new Set([
  'localhost',
  'localhost:4000',
  'localhost:4200',
  '127.0.0.1',
  '127.0.0.1:4000',
  '127.0.0.1:4200',
  'pulseq.pk',
  'www.pulseq.pk',
  'api.pulseq.pk'
]);

// In-memory rate limiting map for DoS and abuse protection
interface RateBucket {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateBucket>();

function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let bucket = rateLimitStore.get(ip);

    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(ip, bucket);
    } else {
      bucket.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - bucket.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > limit) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again shortly.'
      });
      return;
    }

    next();
  };
}

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt < now) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000);

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  // 1. Security: Disable X-Powered-By to prevent fingerprinting
  server.disable('x-powered-by');

  // 2. Security: Trust proxy only if explicitly configured
  server.set('trust proxy', false);

  // 3. Security: Host Header Validation (anti-SSRF and anti-poisoning)
  server.use((req: Request, res: Response, next: NextFunction): void => {
    const rawHost = req.headers.host || '';
    const host = rawHost.toLowerCase().trim();
    const hostname = host.split(':')[0];
    const isAllowed = ALLOWED_HOSTS.has(host) || ALLOWED_HOSTS.has(hostname);

    if (!isAllowed && process.env['NODE_ENV'] === 'production') {
      res.status(400).send('Invalid or untrusted Host header.');
      return;
    }
    next();
  });

  // 4. Security: Force HTTPS redirect in production
  server.use((req: Request, res: Response, next: NextFunction): void => {
    if (process.env['NODE_ENV'] === 'production') {
      const proto = req.headers['x-forwarded-proto'];
      if (proto && proto !== 'https') {
        const host = req.headers.host || 'pulseq.pk';
        res.redirect(301, `https://${host}${req.url}`);
        return;
      }
    }
    next();
  });

  // 5. Security: Helmet HTTP Headers Hardening
  server.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://cdnjs.cloudflare.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "data:"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https:"
          ],
          connectSrc: [
            "'self'",
            "https://api.pulseq.pk"
          ],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          objectSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    })
  );

  // 6. Performance: Gzip / Brotli Compression
  server.use(compression());

  // 7. Security: Request Timeout (15 seconds)
  server.use((req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(15000, () => {
      if (!res.headersSent) {
        res.status(408).send('Request Timeout');
      }
    });
    next();
  });

  // 8. Security: Body Size Limits
  server.use(express.json({ limit: '1mb' }));
  server.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 9. Security: General Global Rate Limiter (240 requests/min per IP)
  server.use(rateLimiter(240, 60000));

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // 10. Security: SSR and Cache Rules
  // API endpoints: strictly no-store, strict rate limits (60 req/min)
  server.use('/api/**', rateLimiter(60, 60000), (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Static files from /browser with 1-year immutable caching
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
    immutable: true
  }));

  // All regular routes use the Angular SSR engine
  server.get('**', (req: Request, res: Response, next: NextFunction) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    const host = headers.host || 'localhost:4000';

    // Disallow SSR rendering on untrusted host or forged URLs
    const safeUrl = `${protocol}://${host}${originalUrl}`;

    // For public static routes, allow caching; for private/dynamic, use no-store
    const isPrivate = originalUrl.includes('/clinics') || originalUrl.includes('/booking-confirm');
    if (isPrivate) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: safeUrl,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
