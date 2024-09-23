import { DiskUsageStats } from '@bindings/DiskUsageStats.ts';

const calculatePercentage = (value: number = 0, limit: number): number =>
  Math.min(100, Math.max(0, Math.floor((value / limit) * 100)));

export function getPercentageStats(data?: DiskUsageStats, isLoaded?: boolean) {
  const limit = data?.limit || 1;

  const percentageActive = calculatePercentage(data?.active, limit);
  const percentageBin = calculatePercentage(data?.bin, limit);
  const remainingPercentage = 100 - percentageActive - percentageBin;

  const altertLimit = remainingPercentage < 10;
  const warningLimit = remainingPercentage < 20;

  return {
    percentageActive,
    percentageBin,
    remainingPercentage,
    alertLimit: altertLimit,
    warningLimit,
    isLoaded: isLoaded,
  };
}
