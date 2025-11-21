import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';
import { observeHttp, incRequest, isEnabled } from '../metrics/metrics.service';

const logger = new Logger('HTTP');

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const requestId = (req as any).requestId ?? req.headers['x-request-id'];

    // When response finishes, log important fields
    res.on('finish', () => {
        const duration = Date.now() - start;
        const msg = {
            method: req.method,
            path: req.originalUrl || req.url,
            status: res.statusCode,
            durationMs: duration,
            requestId,
            ip: req.ip,
        };

        // Structured log as JSON string to keep compatibility with simple loggers
        logger.log(JSON.stringify(msg));

        // Record metrics if prom-client is available
        if (isEnabled()) {
            try {
                incRequest();
                observeHttp(duration);
            } catch (e) {
                // ignore metric failures
            }
        }
    });

    next();
}
