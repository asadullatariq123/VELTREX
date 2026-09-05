export class RealtimeAuth {
  public static validateLocationSubscription(locationId: any): boolean {
    if (!locationId || typeof locationId !== 'string') {
      return false;
    }
    // Simple non-empty string check
    return locationId.trim().length > 0;
  }
}
