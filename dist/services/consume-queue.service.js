"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumeQueueService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const bullmq_1 = require("bullmq");
const component_1 = require("../component");
const keys_1 = require("../keys");
let ConsumeQueueService = class ConsumeQueueService {
    constructor(component) {
        this.component = component;
        this.workers = [];
    }
    async init() {
        if (!this.component.sharedConnection)
            return;
        const enabledWorkerQueueNames = this.getEnabledWorkerQueueNames();
        const promises = this.component.config.queues.basic
            .filter((queue) => !!enabledWorkerQueueNames.find(enabledQueue => enabledQueue.name === queue.name))
            .map((queue) => this.instanciateWorker(queue, this.component.sharedConnection));
        this.workers.push(...(await Promise.all(promises)));
        console.log('WORKERS : ', this.workers);
    }
    async stop() {
        await Promise.all(this.workers.map((worker) => worker.close()));
    }
    /**
     * Use the env variable to know which queue name this worker should handle
     * @private
     * @returns
     */
    getEnabledWorkerQueueNames() {
        const allQueues = this.component.config.queues.basic;
        allQueues.push(this.component.config.queues.schedule);
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
        const consumer = await this.component.application.get(`services.${queue.name}Consumer`);
        return new bullmq_1.Worker(queue.name, (job) => consumer.process(job), {
            ...((_a = queue.workerOptions) !== null && _a !== void 0 ? _a : {}),
            connection: sharedConnection,
        });
    }
};
ConsumeQueueService = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject(keys_1.JobComponentBindings.COMPONENT)),
    tslib_1.__metadata("design:paramtypes", [component_1.JobComponent])
], ConsumeQueueService);
exports.ConsumeQueueService = ConsumeQueueService;
exports.default = ConsumeQueueService;
//# sourceMappingURL=consume-queue.service.js.map