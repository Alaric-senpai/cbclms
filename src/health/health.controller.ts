import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { metrics, isEnabled } from '../common/metrics/metrics.service';

@Controller()
export class HealthController {
    @Get('health')
    health() {
        return {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }

    @Get('metrics')
    async metrics(@Res() res: Response) {
        if (!isEnabled()) {
            return res.json({
                message:
                    'Metrics not enabled. Install `prom-client` and enable metrics collection.',
            });
        }

        const payload = await metrics();
        if (!payload) {
            return res.status(500).json({ message: 'Failed to collect metrics' });
        }

        res.setHeader('Content-Type', 'text/plain; version=0.0.4');
        return res.send(payload);
    }
}
