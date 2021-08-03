"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobHandler = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const keys_1 = require("./keys");
const bullmq_1 = require("bullmq");
// Configure the binding for JobHandler
let JobHandler = class JobHandler {
    constructor(application, options) {
        this.application = application;
        this.options = options;
        this.enabledQueues = null;
    }
    getQueue(name) {
        if (!this.enabledQueues)
            return null;
        return this.enabledQueues[name];
    }
    async start() {
        this.enabledQueues = Object.fromEntries(this.getEnabledWorkerQueues().map(q => [
            q.name,
            {
                queue: new bullmq_1.Queue(q.name, {
                    connection: this.options.redisConfig,
                    ...q.queueOptions,
                }),
                events: new bullmq_1.QueueEvents(q.name, {
                    connection: this.options.redisConfig,
                    ...q.eventsOptions,
                }),
                workers: [],
                schedulers: [],
            },
        ]));
        if (this.options.canSchedule) {
            await this.initQueueSchedulers();
        }
        if (this.options.canConsume) {
            await this.initQueueWorkers();
        }
    }
    async stop() {
        if (!this.enabledQueues)
            return;
        if (this.options.canConsume) {
            const promises = [];
            for (const enabledQueueName in this.enabledQueues) {
                promises.push(...this.enabledQueues[enabledQueueName].workers.map(w => w.close()));
            }
            if (promises.length > 0) {
                await Promise.all(promises);
            }
        }
    }
    async initQueueSchedulers() {
        var _a, _b;
        if (!this.enabledQueues)
            return;
        for (const enabledQueueName of Object.keys(this.enabledQueues)) {
            this.enabledQueues[enabledQueueName].schedulers.push(new bullmq_1.QueueScheduler(enabledQueueName, {
                connection: this.options.redisConfig,
                ...((_b = (_a = this.options.queues.find(q => q.name === enabledQueueName)) === null || _a === void 0 ? void 0 : _a.schedulerOptions) !== null && _b !== void 0 ? _b : {}),
            }));
        }
    }
    async initQueueWorkers() {
        var _a, _b;
        if (!this.enabledQueues)
            return;
        for (const enabledQueueName of Object.keys(this.enabledQueues)) {
            this.enabledQueues[enabledQueueName].workers.push(await this.instanciateWorker(enabledQueueName, (_b = (_a = this.options.queues.find(q => q.name === enabledQueueName)) === null || _a === void 0 ? void 0 : _a.workerOptions) !== null && _b !== void 0 ? _b : {}));
        }
    }
    getEnabledWorkerQueues() {
        const allQueues = this.options.queues;
        const workerNames = this.options.enabledQueueNames;
        return allQueues.filter((queue) => workerNames.includes(queue.name));
    }
    async instanciateWorker(name, options) {
        const consumer = await this.application.get(keys_1.JobHandlerBindings.generateConsumerPathFromName(name, this.options.suffixForConsumers));
        return new bullmq_1.Worker(name, job => consumer.process(job), {
            connection: this.options.redisConfig,
            ...(options !== null && options !== void 0 ? options : {}),
        });
    }
};
JobHandler = tslib_1.__decorate([
    core_1.injectable({
        tags: {
            [core_1.ContextTags.KEY]: keys_1.JobHandlerBindings.COMPONENT,
            [core_1.CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: keys_1.JobHandlerBindings.JOB_HANDLER_OBSERVER_GROUP,
        },
        scope: core_1.BindingScope.SINGLETON,
    }),
    tslib_1.__param(0, core_1.inject(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, core_1.config()),
    tslib_1.__metadata("design:paramtypes", [core_1.Application, Object])
], JobHandler);
exports.JobHandler = JobHandler;
//# sourceMappingURL=component.js.map