import { JobsOptions, Queue, QueueScheduler } from 'bullmq';
import { JobComponent } from '../component';
import { RepeatableJob } from '../types';
export declare class ScheduleQueueService {
    private component;
    queueSchedulers: QueueScheduler[];
    queue: Queue;
    constructor(component: JobComponent);
    init(): Promise<void>;
    syncSchedule(name: string, payload: unknown, options: JobsOptions, currentJobs: RepeatableJob[]): Promise<void>;
}
