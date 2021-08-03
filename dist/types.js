"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLE_JOB_HANDLER_OPTIONS = void 0;
/**
 * Default options for the Job handler
 */
exports.SAMPLE_JOB_HANDLER_OPTIONS = {
    redisConfig: {
        host: '127.0.0.1',
        port: 6379,
        password: '',
        db: 0,
    },
    canConsume: false,
    canSchedule: false,
    enabledQueueNames: ['example'],
    queues: [{ name: 'example' }],
    suffixForConsumers: 'Consumer'
};
//# sourceMappingURL=types.js.map