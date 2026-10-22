export function validateImportedPlan(parsed: unknown): { valid: boolean; error?: string } {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'File content must be a valid JSON object.' };
  }
  const obj = parsed as Record<string, any>;
  if (!obj.summary?.title) {
    return { valid: false, error: 'Missing celebration title in plan summary.' };
  }
  if (!Array.isArray(obj.timeline)) {
    return { valid: false, error: 'Timeline must be an array of milestones.' };
  }
  if (!obj.budgetBreakdown || !Array.isArray(obj.budgetBreakdown.items)) {
    return { valid: false, error: 'Budget breakdown must contain an items array.' };
  }
  return { valid: true };
}
