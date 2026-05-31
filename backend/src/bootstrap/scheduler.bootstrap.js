import { startScheduler } from "../jobs/scheduler.job.js";

/**
 * Bootstraps the background automation scheduler.
 * Isolated to allow separating API workers from scheduler workers in the future.
 */
export const bootstrapScheduler = () => {
  if (process.env.NODE_ENV !== "test") {
    startScheduler();
  }
};
