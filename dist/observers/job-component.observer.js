"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobComponentObserver = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const bullmq_1 = require("bullmq");
const component_1 = require("../component");
const keys_1 = require("../keys");
let JobComponentObserver = class JobComponentObserver {
    constructor(component) {
        this.component = component;
    }
    async start() {
        this.component.queues = Object.fromEntries(this.getEnabledWorkerQueue().map((q) => [q.name, new bullmq_1.Queue(q.name)]));
        await this.component.initSharedConnection();
        if (this.component.config.canSchedule) {
            await this.initQueueSchedulers();
        }
        if (this.component.config.canConsume) {
            await this.initQueueWorkers();
        }
    }
    async stop() {
        if (this.component.config.canConsume) {
            await Promise.all(this.component.workers.map((worker) => worker.close()));
        }
    }
    async initQueueSchedulers() {
        const allQueues = this.component.config.queues;
        this.component.queueSchedulers.push(...allQueues.map((q) => {
            var _a;
            return new bullmq_1.QueueScheduler(q.name, {
                connection: this.component.config.redisConfig,
                ...((_a = q.queueOptions) !== null && _a !== void 0 ? _a : {}),
            });
        }));
    }
    async initQueueWorkers() {
        if (!this.component.sharedConnection)
            return;
        const enabledWorkerQueueNames = this.getEnabledWorkerQueue();
        const promises = this.component.config.queues
            .filter((queue) => !!enabledWorkerQueueNames
            .find(enabledQueue => enabledQueue.name === queue.name))
            .map((queue) => this.instanciateWorker(queue, this.component.sharedConnection));
        this.component.workers.push(...(await Promise.all(promises)));
    }
    getEnabledWorkerQueue() {
        const allQueues = this.component.config.queues;
        console.log(process.env.WORKER_QUEUES);
        if (!process.env.WORKER_QUEUES)
            return allQueues;
        const workerNames = process.env.WORKER_QUEUES.split(',').map((name) => name.trim().toLowerCase());
        if (workerNames.includes('*'))
            return allQueues;
        return allQueues.filter((queue) => workerNames.includes(queue.name.toLowerCase()));
    }
    async instanciateWorker(queue, sharedConnection) {
        var _a;
        const consumer = await this.component.application
            .get(`services.${queue.name}Consumer`);
        return new bullmq_1.Worker(queue.name, (job) => consumer.process(job), {
            ...((_a = queue.workerOptions) !== null && _a !== void 0 ? _a : {}),
            connection: sharedConnection,
        });
    }
};
JobComponentObserver = tslib_1.__decorate([
    core_1.lifeCycleObserver(),
    tslib_1.__param(0, core_1.inject(keys_1.JobComponentBindings.COMPONENT)),
    tslib_1.__metadata("design:paramtypes", [component_1.JobComponent])
], JobComponentObserver);
exports.JobComponentObserver = JobComponentObserver;
exports.default = JobComponentObserver;
//# sourceMappingURL=job-component.observer.js.map