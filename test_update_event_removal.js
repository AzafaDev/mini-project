// Test script to verify update event feature removal
const fs = require('fs');
const path = require('path');

console.log('Testing update event feature removal...\n');

// Test 1: Check if backend route is removed
const backendRoutePath = path.join(__dirname, 'backend/src/modules/events/event.route.ts');
const backendRouteContent = fs.readFileSync(backendRoutePath, 'utf8');
if (backendRouteContent.includes('eventRouter.put')) {
  console.log('❌ FAIL: Backend PUT route still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Backend PUT route removed');
}

// Test 2: Check if backend controller has updateEvent
const backendControllerPath = path.join(__dirname, 'backend/src/modules/events/event.controller.ts');
const backendControllerContent = fs.readFileSync(backendControllerPath, 'utf8');
if (backendControllerContent.includes('updateEvent:')) {
  console.log('❌ FAIL: Backend updateEvent controller still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Backend updateEvent controller removed');
}

// Test 3: Check if backend service has updateEvent
const backendServicePath = path.join(__dirname, 'backend/src/modules/events/event.service.ts');
const backendServiceContent = fs.readFileSync(backendServicePath, 'utf8');
if (backendServiceContent.includes('updateEvent:')) {
  console.log('❌ FAIL: Backend updateEvent service still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Backend updateEvent service removed');
}

// Test 4: Check if backend schema has updateEventSchema
const backendSchemaPath = path.join(__dirname, 'backend/src/modules/events/event.schema.ts');
const backendSchemaContent = fs.readFileSync(backendSchemaPath, 'utf8');
if (backendSchemaContent.includes('updateEventSchema')) {
  console.log('❌ FAIL: Backend updateEventSchema still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Backend updateEventSchema removed');
}

// Test 5: Check if frontend EditEventPage is removed
const frontendEditPagePath = path.join(__dirname, 'frontend/src/pages/EditEventPage.tsx');
if (fs.existsSync(frontendEditPagePath)) {
  console.log('❌ FAIL: Frontend EditEventPage.tsx still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Frontend EditEventPage.tsx removed');
}

// Test 6: Check if frontend App.tsx has edit route
const frontendAppPath = path.join(__dirname, 'frontend/src/App.tsx');
const frontendAppContent = fs.readFileSync(frontendAppPath, 'utf8');
if (frontendAppContent.includes('/events/:id/edit')) {
  console.log('❌ FAIL: Frontend edit route still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Frontend edit route removed');
}

// Test 7: Check if frontend EventItem has onEdit prop
const frontendEventItemPath = path.join(__dirname, 'frontend/src/components/events/EventItem.tsx');
const frontendEventItemContent = fs.readFileSync(frontendEventItemPath, 'utf8');
if (frontendEventItemContent.includes('onEdit?:')) {
  console.log('❌ FAIL: Frontend EventItem still has onEdit prop');
  process.exit(1);
} else {
  console.log('✅ PASS: Frontend EventItem onEdit prop removed');
}

// Test 8: Check if frontend event.service has updateEvent
const frontendEventServicePath = path.join(__dirname, 'frontend/src/services/event.service.ts');
const frontendEventServiceContent = fs.readFileSync(frontendEventServicePath, 'utf8');
if (frontendEventServiceContent.includes('updateEvent:')) {
  console.log('❌ FAIL: Frontend event.service still has updateEvent');
  process.exit(1);
} else {
  console.log('✅ PASS: Frontend event.service updateEvent removed');
}

// Test 9: Check if frontend useEventStore has updateEvent
const frontendEventStorePath = path.join(__dirname, 'frontend/src/stores/useEventStore.ts');
const frontendEventStoreContent = fs.readFileSync(frontendEventStorePath, 'utf8');
if (frontendEventStoreContent.includes('updateEvent:')) {
  console.log('❌ FAIL: Frontend useEventStore still has updateEvent');
  process.exit(1);
} else {
  console.log('✅ PASS: Frontend useEventStore updateEvent removed');
}

// Test 10: Check if frontend validation has updateEventSchema
const frontendValidationPath = path.join(__dirname, 'frontend/src/validation/eventSchemas.ts');
const frontendValidationContent = fs.readFileSync(frontendValidationPath, 'utf8');
if (frontendValidationContent.includes('updateEventSchema')) {
  console.log('❌ FAIL: Frontend validation still has updateEventSchema');
  process.exit(1);
} else {
  console.log('✅ PASS: Frontend validation updateEventSchema removed');
}

console.log('\n✅ All tests passed! Update event feature successfully removed.');
