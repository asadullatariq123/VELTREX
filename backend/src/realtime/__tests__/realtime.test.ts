import { realtimePublisher } from '../realtimePublisher';
import { VeltrexRealtimeEventType, ClientSubscriptionEvent } from '../realtimeEvents';
import { RealtimeRooms } from '../realtimeRooms';
import { RealtimeAuth } from '../realtimeAuth';
import { systemController } from '../../controllers/systemController';

export function runRealtimeTests() {
  console.log('🧪 Running VELTREX Real-Time Intelligence & WebSockets Unit Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string, actual?: any) {
    if (condition) {
      console.log(` ✅ PASS: ${description}${actual !== undefined ? ` (actual: ${JSON.stringify(actual)})` : ''}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${description}${actual !== undefined ? ` (actual: ${JSON.stringify(actual)})` : ''}`);
      failed++;
    }
  }

  // Test 1: Realtime room names
  assert(RealtimeRooms.GLOBAL === 'global', 'Global room is "global"', RealtimeRooms.GLOBAL);
  assert(RealtimeRooms.DASHBOARD === 'dashboard', 'Dashboard room is "dashboard"', RealtimeRooms.DASHBOARD);
  assert(RealtimeRooms.location('loc-aizawl') === 'location:loc-aizawl', 'Location room format', RealtimeRooms.location('loc-aizawl'));

  // Test 2: Realtime Auth / Subscription Validation
  assert(RealtimeAuth.validateLocationSubscription('loc-01') === true, 'Valid locationId returns true');
  assert(RealtimeAuth.validateLocationSubscription('') === false, 'Empty locationId returns false');
  assert(RealtimeAuth.validateLocationSubscription(null) === false, 'Null locationId returns false');

  // Test 3: Event Payload Formatting & Unique Event ID Generation
  const evt = realtimePublisher.publish(
    VeltrexRealtimeEventType.RISK_UPDATED,
    {
      locationId: 'test-loc-01',
      locationName: 'Shillong Peak',
      previousScore: 45,
      currentScore: 78,
      previousLevel: 'MODERATE',
      currentLevel: 'CRITICAL',
      trend: 'RAPIDLY_INCREASING'
    },
    { locationId: 'test-loc-01', source: 'SYSTEM' }
  );

  assert(Boolean(evt.eventId), 'Generated event contains unique eventId', evt.eventId);
  assert(evt.eventType === VeltrexRealtimeEventType.RISK_UPDATED, 'EventType matches RISK_UPDATED', evt.eventType);
  assert(evt.locationId === 'test-loc-01', 'LocationId matches input', evt.locationId);
  assert(evt.sequence === 1, 'Sequence counter set to 1 for new location stream', evt.sequence);

  // Test 4: Event Sequence Increment
  const evt2 = realtimePublisher.publish(
    VeltrexRealtimeEventType.PREDICTION_UPDATED,
    { probability: 0.84 },
    { locationId: 'test-loc-01' }
  );
  assert(evt2.sequence === 2, 'Sequence counter increments to 2 for same location stream', evt2.sequence);

  // Test 5: Event Deduplication Tracking
  assert(realtimePublisher.isDuplicate(evt.eventId) === true, 'Published eventId tracked in deduplication cache');

  // Test 6: Room Isolation Verification
  const roomA = RealtimeRooms.location('loc-A');
  const roomB = RealtimeRooms.location('loc-B');
  assert(roomA !== roomB, 'Location A and Location B rooms are isolated', { roomA, roomB });

  // Test 7: System Status Controller Mock Test
  const mockReq: any = {};
  let statusResult: any = null;
  const mockRes: any = {
    status: function (code: number) {
      assert(code === 200, 'System status API returns HTTP 200', code);
      return this;
    },
    json: function (payload: any) {
      statusResult = payload;
    }
  };

  systemController.getSystemStatus(mockReq, mockRes, () => {}).then(() => {
    assert(statusResult?.success === true, 'System status response success is true');
    assert(statusResult?.data?.api === 'ONLINE', 'System status API status is ONLINE', statusResult?.data?.api);

    console.log(`\n==================================================`);
    console.log(`📊 Real-Time WebSocket Unit Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  });
}
