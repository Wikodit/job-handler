"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobHandler = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const ioredis_1 = tslib_1.__importDefault(require("ioredis"));
const keys_1 = require("./keys");
const observers_1 = require("./observers");
// Configure the binding for JobHandler
let JobHandler = class JobHandler {
    constructor(application, options) {
        this.application = application;
        this.options = options;
        this.lifeCycleObservers = [observers_1.JobHandlerObserver];
        this.enabledQueues = null;
        this.sharedConnection = null;
    }
    get config() {
        return JSON.parse(JSON.stringify(this.options));
    }
    async initSharedConnection() {
        this.sharedConnection = new ioredis_1.default(this.options.redisConfig);
    }
    getQueue(name) {
        if (!this.enabledQueues)
            return null;
        return this.enabledQueues[name];
    }
};
JobHandler = tslib_1.__decorate([
    core_1.injectable({ tags: { [core_1.ContextTags.KEY]: keys_1.JobHandlerBindings.COMPONENT } }),
    tslib_1.__param(0, core_1.inject(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, core_1.config()),
    tslib_1.__metadata("design:paramtypes", [core_1.Application, Object])
], JobHandler);
exports.JobHandler = JobHandler;
//# sourceMappingURL=component.js.map