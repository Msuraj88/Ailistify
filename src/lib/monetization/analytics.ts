export function calculateCtr(views: number, clicks: number): number {
  if (views <= 0) {
    return 0;
  }

  return Math.round((clicks / views) * 10000) / 100;
}

export function formatCtr(views: number, clicks: number): string {
  return `${calculateCtr(views, clicks).toFixed(2)}%`;
}
