// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every day at midnight UTC
crons.daily(
  "collect-analytics",
  { hourUTC: 0, minuteUTC: 0 },
  internal.analytics.triggerDailySync,
  {}
);

export default crons;