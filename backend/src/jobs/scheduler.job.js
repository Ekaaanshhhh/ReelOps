import cron from "node-cron";
import { executeAutomation } from "../services/execution.service.js";
import { claimNextAutomation, recoverStaleLocks } from "../services/automationLock.service.js";

/**
 * Automation Scheduler Job
 *
 * Singleton cron job that runs every minute to detect and execute
 * due automations. Uses a module-level flag to prevent duplicate
 * cron instances during hot reloads (node --watch).
 */

let isSchedulerRunning = false;

/**
 * Start the automation scheduler.
 * Safe to call multiple times — only the first call starts the cron.
 */
export const startScheduler = () => {
  if (isSchedulerRunning) {
    console.log("⚠️  Scheduler already running — skipping duplicate init");
    return;
  }

  isSchedulerRunning = true;

  // Run every minute: * * * * *
  cron.schedule("* * * * *", processAutomations);

  console.log("⏰ Automation scheduler started (runs every minute)");
};

/**
 * Find all due automations and execute them sequentially using atomic claiming.
 * Each automation is processed independently.
 */
const processAutomations = async () => {
  const cycleStart = Date.now();
  const metrics = {
    claimed: 0,
    executed: 0,
    failed: 0,
    recovered: 0,
  };

  try {
    // 1. Recover any stale locks before starting new work
    metrics.recovered = await recoverStaleLocks();

    // 2. Process automations one by one
    while (true) {
      const automation = await claimNextAutomation();
      if (!automation) break; // Queue empty

      metrics.claimed++;

      try {
        await executeAutomation(automation);
        metrics.executed++;
      } catch (error) {
        console.error(
          `❌ Unexpected error processing automation ${automation._id}:`,
          error.message
        );
        metrics.failed++;
      }
    }

    // 3. Log cycle metrics if any work was done
    if (metrics.claimed > 0 || metrics.recovered > 0) {
      const duration = Date.now() - cycleStart;
      console.log(`\n📊 --- Scheduler Cycle Metrics ---`);
      console.log(`⏱️  Duration:  ${duration}ms`);
      console.log(`♻️  Recovered: ${metrics.recovered}`);
      console.log(`🔒 Claimed:   ${metrics.claimed}`);
      console.log(`✅ Executed:  ${metrics.executed}`);
      if (metrics.failed > 0) {
        console.log(`❌ Failed:    ${metrics.failed}`);
      }
      console.log(`----------------------------------\n`);
    }

  } catch (error) {
    console.error("❌ Scheduler error:", error.message);
  }
};
