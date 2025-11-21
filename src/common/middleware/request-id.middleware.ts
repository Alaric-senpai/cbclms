import { Request, Response, NextFunction } from 'express';

// Use Node's crypto.randomUUID when available (Node 14.17+, 16+), otherwise fallback.
function generateId(): string {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { randomUUID } = require('crypto');
        return randomUUID();
    } catch (e) {
        return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
}

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction) {
    const headerName = 'x-request-id';
    let id = req.headers[headerName] as string | undefined;
    if (!id) {
        id = generateId();
        // set header for downstream services
        req.headers[headerName] = id as any;
    }
    // also expose on req object for convenience
    (req as any).requestId = id;
    next();
}
