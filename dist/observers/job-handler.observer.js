"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobHandlerObserver = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const bullmq_1 = require("bullmq");
const component_1 = require("../component");
const keys_1 = require("../keys");
let JobHandlerObserver = class JobHandlerObserver {
    constructor(component) {
        this.component = component;
    }
    async start() {
        this.component.enabledQueues = Object.fromEntries(this.getEnabledWorkerQueues().map(q => [
            q.name,
            {
                queue: new bullmq_1.Queue(q.name, {
                    connection: this.component.config.redisConfig,
                    ...q.queueOptions,
                }),
                events: new bullmq_1.QueueEvents(q.name, {
                    connection: this.component.config.redisConfig,
                    ...q.eventsOptions,
                }),
                workers: [],
                schedulers: [],
            },
        ]));
        if (this.component.config.canSchedule) {
            await this.initQueueSchedulers();
        }
        if (this.component.config.canConsume) {
            await this.initQueueWorkers();
        }
    }
    async stop() {
        if (!this.component.enabledQueues)
            return;
        if (this.component.config.canConsume) {
            const promises = [];
            for (const enabledQueueName in this.component.enabledQueues) {
                promises.push(...this.component.enabledQueues[enabledQueueName].workers.map(w => w.close()));
            }
            if (promises.length > 0) {
                await Promise.all(promises);
            }
        }
    }
    async initQueueSchedulers() {
        var _a, _b;
        if (!this.component.enabledQueues)
            return;
        for (const enabledQueueName of Object.keys(this.component.enabledQueues)) {
            this.component.enabledQueues[enabledQueueName].schedulers.push(new bullmq_1.QueueScheduler(enabledQueueName, {
                connection: this.component.config.redisConfig,
                ...((_b = (_a = this.component.config.queues.find(q => q.name === enabledQueueName)) === null || _a === void 0 ? void 0 : _a.schedulerOptions) !== null && _b !== void 0 ? _b : {}),
            }));
        }
    }
    async initQueueWorkers() {
        var _a, _b;
        if (!this.component.enabledQueues)
            return;
        for (const enabledQueueName of Object.keys(this.component.enabledQueues)) {
            this.component.enabledQueues[enabledQueueName].workers.push(await this.instanciateWorker(enabledQueueName, (_b = (_a = this.component.config.queues.find(q => q.name === enabledQueueName)) === null || _a === void 0 ? void 0 : _a.workerOptions) !== null && _b !== void 0 ? _b : {}));
        }
    }
    getEnabledWorkerQueues() {
        const allQueues = this.component.config.queues;
        const workerNames = this.component.config.enabledQueueNames;
        return allQueues.filter((queue) => workerNames.includes(queue.name));
    }
    async instanciateWorker(name, options) {
        const consumer = await this.component.application.get(`services.${name}Consumer`);
        return new bullmq_1.Worker(name, job => consumer.process(job), {
            connection: this.component.config.redisConfig,
            ...(options !== null && options !== void 0 ? options : {}),
        });
    }
};
JobHandlerObserver = tslib_1.__decorate([
    core_1.lifeCycleObserver(),
    tslib_1.__param(0, core_1.inject(keys_1.JobHandlerBindings.COMPONENT)),
    tslib_1.__metadata("design:paramtypes", [component_1.JobHandler])
], JobHandlerObserver);
exports.JobHandlerObserver = JobHandlerObserver;
exports.default = JobHandlerObserver;
//# sourceMappingURL=job-handler.observer.js.map