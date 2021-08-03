"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobHandlerBindings = void 0;
const core_1 = require("@loopback/core");
/**
 * Binding keys used by this component.
 */
var JobHandlerBindings;
(function (JobHandlerBindings) {
    JobHandlerBindings.COMPONENT = core_1.BindingKey.create(`${core_1.CoreBindings.COMPONENTS}.JobHandler`);
    JobHandlerBindings.JOB_HANDLER_OBSERVER_GROUP = 'jobHandler';
    JobHandlerBindings.JOB_HANDLER_CONSUMER_BASE_PATH = 'jobHandler.consumers';
    JobHandlerBindings.generateConsumerPathFromName = (name, suffix) => `${JobHandlerBindings.JOB_HANDLER_CONSUMER_BASE_PATH}.${name}${suffix !== null && suffix !== void 0 ? suffix : ''}`;
})(JobHandlerBindings = exports.JobHandlerBindings || (exports.JobHandlerBindings = {}));
//# sourceMappingURL=keys.js.map