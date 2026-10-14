export function canAccessActivities(isAdmin: boolean, isCoach: boolean) {
  return isAdmin || isCoach;
}