export const opportunityNavigationKeys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"] as const;

export type OpportunityNavigationKey = (typeof opportunityNavigationKeys)[number];

export function isOpportunityNavigationKey(key: string): key is OpportunityNavigationKey {
  return opportunityNavigationKeys.includes(key as OpportunityNavigationKey);
}

export function nextOpportunityIndex(currentIndex: number, count: number, key: OpportunityNavigationKey): number {
  if (count <= 0) {
    return -1;
  }

  const safeIndex = Math.min(Math.max(currentIndex, 0), count - 1);

  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }
  if (key === "ArrowDown" || key === "ArrowRight") {
    return Math.min(safeIndex + 1, count - 1);
  }
  return Math.max(safeIndex - 1, 0);
}
