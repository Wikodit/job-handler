"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleQueueService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const bullmq_1 = require("bullmq");
const component_1 = require("../component");
const keys_1 = require("../keys");
let ScheduleQueueService = class ScheduleQueueService {
    constructor(component) {
        this.component = component;
        this.queueSchedulers = [];
        this.queue = new bullmq_1.Queue(component.config.queues.schedule.name);
    }
    async init() {
        var _a;
        this.queueSchedulers.push(new bullmq_1.QueueScheduler(this.component.config.queues.schedule.name, {
            connection: this.component.config.redisConfig,
            ...((_a = this.component.config.queues.schedule.options) !== null && _a !== void 0 ? _a : {}),
        }));
        await this.syncSchedule('toto', { test: 'hello' }, { repeat: { every: 1 } }, []);
        console.log('SCHEDULERS : ', this.queueSchedulers);
    }
    async syncSchedule(name, payload, options, currentJobs) {
        // Remove previous job with same name
        await Promise.all(currentJobs
            .filter((job) => job.name === name)
            .map(async (job) => this.queue.removeRepeatableByKey(job.key)));
        await this.queue.add(name, payload, options);
    }
};
ScheduleQueueService = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject(keys_1.JobComponentBindings.COMPONENT)),
    tslib_1.__metadata("design:paramtypes", [component_1.JobComponent])
], ScheduleQueueService);
exports.ScheduleQueueService = ScheduleQueueService;
//# sourceMappingURL=schedule-queue.service.js.map