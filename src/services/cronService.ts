import { Mutex } from "async-mutex";
import cron, { ScheduledTask } from "node-cron";

type CronJobOptions = {
    schedule: string; // Cron schedule expression
    job: (context?: any) => void; // Job function to execute
    context?: any; // Optional context to pass to the job function
    todayOnly?: boolean; // If true, the job will run only today
    runOnInit?: boolean; // If true, the job will run immediately upon initialization
};

class CronService {
    private static _instance: CronService | null = null;
    // Mutex to ensure thread-safe singleton initialization
    private static _mutex = new Mutex();
    private jobs: Map<string, ScheduledTask> = new Map();

    // Prevent direct instantiation
    private constructor() {}

    static async getInstance(): Promise<CronService> {
        //First check without lock
        if (CronService._instance) {
            return CronService._instance;
        }
        await CronService._mutex.runExclusive(async () => {
            //Second check within lock
            if (!CronService._instance) {
                CronService._instance = new CronService();
            }
        });
        return CronService._instance!;
    }

    // Create and schedule a new cron job
    CreateJob(name: string, options: CronJobOptions) {
        if (this.jobs.has(name)) {
            throw new Error(`⚠️ Cron job with name ${name} already exists.`);
        }

        const task = cron.schedule(options.schedule, async () => {
            try {
                let context = options.context || {};

                if (options.todayOnly) {
                    const startOfDay = new Date();
                    startOfDay.setHours(0, 0, 0, 0);

                    const endOfDay = new Date();
                    endOfDay.setHours(23, 59, 59, 999);
                    context = { ...context, startOfDay, endOfDay };
                }

                await options.job(context);
            } catch (error) {
                console.error(
                    `❌ Error occurred while executing cron job ${name}:`,
                    error
                );
            }
        });

        if (options.runOnInit) {
            try {
                options.job(options.context);
            } catch (err) {
                console.error(`❌ Error in immediate run of '${name}':`, err);
            }
        }

        this.jobs.set(name, task);
    }

    // Remove a cron job
    removeJob(name: string) {
        const job = this.jobs.get(name);
        if (job) {
            job.stop();
            this.jobs.delete(name);
        }
    }

    // Start all jobs
    startAllJobs() {
        this.jobs.forEach((job) => job.start());
    }

    // Stop all jobs
    stopAllJobs() {
        this.jobs.forEach((job) => job.stop());
    }
}

export default CronService;
