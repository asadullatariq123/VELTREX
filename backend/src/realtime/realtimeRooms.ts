export class RealtimeRooms {
  public static GLOBAL = 'global';
  public static DASHBOARD = 'dashboard';

  public static location(locationId: string): string {
    return `location:${locationId}`;
  }

  public static state(stateId: string): string {
    return `state:${stateId}`;
  }
}
