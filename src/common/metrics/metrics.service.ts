/**
 * Lightweight metrics wrapper that tries to use `prom-client` if installed.
 * Exposes: isEnabled(), metrics(), observeHttp(durationMs), incRequest()
 */
let enabled = false as boolean;
let client: any = null;
let register: any = null;
let httpRequestDuration: any = null;
let httpRequestsTotal: any = null;

try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    client = require('prom-client');
    register = client.register;

    // Collect default metrics
    try {
        client.collectDefaultMetrics();
    } catch (e) {
        // ignore if collection fails
    }

    // Histogram for request durations (seconds)
    httpRequestDuration = new client.Histogram({
        name: 'http_request_duration_seconds',
        help: 'HTTP request duration in seconds',
        buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    httpRequestsTotal = new client.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
    });

    enabled = true;
} catch (e) {
    // prom-client not installed or failed to initialize; keep disabled
    enabled = false;
}

export function isEnabled(): boolean {
    return enabled;
}

export async function metrics(): Promise<string | null> {
    if (!enabled) return null;
    try {
        return await register.metrics();
    } catch (e) {
        return null;
    }
}

export function observeHttp(durationMs: number) {
    if (!enabled) return;
    try {
        httpRequestDuration.observe(durationMs / 1000);
    } catch (e) {
        // ignore
    }
}

export function incRequest() {
    if (!enabled) return;
    try {
        httpRequestsTotal.inc();
    } catch (e) {
        // ignore
    }
}
