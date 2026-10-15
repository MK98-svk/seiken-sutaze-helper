export function canAccessActivities(isAdmin: boolean, isTrainer: boolean) {
  return isAdmin || isTrainer;
}