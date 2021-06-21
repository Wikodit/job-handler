import { Worker } from 'bullmq';
import { JobComponent } from "../component";
export declare class ConsumeQueueService {
    private component;
    workers: Worker[];
    constructor(component: JobComponent);
    init(): Promise<void>;
    stop(): Promise<void>;
    /**
     * Use the env variable to know which queue name this worker should handle
     * @private
     * @returns
     */
    private getEnabledWorkerQueueNames;
    private instanciateWorker;
}
export default ConsumeQueueService;
