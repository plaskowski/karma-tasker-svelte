# Test Implementation Plan

Based on the test strategy document, this plan outlines the step-by-step implementation of comprehensive testing for the SvelteKit application.

## Phase 1: Infrastructure Setup

### 1. Playwright Configuration
- Install Playwright with Chromium browser
- Configure fixed viewport: 1280×800
- Set timezone: Europe/Warsaw
- Lock browser version for consistency

### 2. Deterministic Environment
- Freeze time using mock Date/timer functions
- Control RNG with seeded random values
- Disable animations via `prefers-reduced-motion` CSS media query
- Configure fixed fonts and themes (light/dark)
- Set up mock mode using app environment flag or Playwright `route()` interception

## Phase 2: Visual (Screenshot) Tests

### 3. Test Structure
Organized test structure with one test per file:
- File structure: `tests/visual/[category]/[test-name].spec.ts`
- Each test in its own file for better isolation
- Store baselines: `tests/visual/[category]/__screenshots__/[test-name].png`

### 4. Loaded State Coverage
Focus on loaded state screenshots only (no interaction states):
- Empty state: Views with no data
- Full state: Views with mock data
- Test key perspectives: Inbox, First, All
- Test projects view
- Test search results

Simplified coverage:
- GTD perspectives (Inbox, First, All) - empty and full states
- Projects view - empty and full states  
- Search view - with and without results
- No hover states, modals, or interaction screenshots

## Phase 3: Interaction Tests

### 5. Core User Flows
Implement Playwright tests for critical paths:

#### Task Management Flow
- Create new task
- Edit task properties
- Complete task
- Delete task
- Bulk operations

#### GTD Perspective Navigation
- Switch between Inbox, Next, Waiting, Scheduled, Someday
- Verify correct task filtering
- Test perspective-specific actions

#### Search and Filter Flow
- Text search functionality
- Filter combinations
- Clear filters
- Results validation

File structure: `tests/e2e/[flow].spec.ts`
Step screenshots: `tests/e2e/__steps__/[flow]/[NN]-[description].png`

## Phase 4: Test Readiness

### 6. Test IDs
Add `data-testid` attributes to all interactive elements:
- Buttons and links
- Form inputs
- Dropdowns and selects
- Modal triggers
- List items
- Navigation elements

### 7. Baseline Management
- Set up screenshot storage structure
- Implement diff comparison tools
- Configure update mechanisms for approved changes
- Create visual diff reporting

## Phase 5: CI/CD Integration

### 8. Visual Regression Gates
PR check configuration:
- Fail on visual differences
- Require manual approval with justification
- Generate diff reports for review
- Store approved baselines in version control

### 9. Interaction Test Gates
- All interaction tests must pass
- Generate trace on failure
- Capture failure screenshots
- No flaky test tolerance

## Phase 6: Documentation

### 10. Test Procedures
Document the following:
- How to run tests locally
- Updating visual baselines
- Debugging failed tests
- Writing new tests
- Mock data management
- CI/CD pipeline interaction

## Implementation Priority

1. **Week 1**: Playwright setup + deterministic environment
2. **Week 2**: Visual tests for all screens
3. **Week 3**: Core interaction flows
4. **Week 4**: CI/CD integration + documentation

## Success Criteria

- 100% screen coverage with visual tests
- Core user flows have interaction tests
- Zero flaky tests
- Sub-5 minute test execution time
- Clear documentation for maintenance

## Maintenance Guidelines

- Review and update tests with each feature change
- Prune obsolete tests promptly
- Keep mock data synchronized with real data structures
- Regular baseline updates for intentional UI changes
- Monitor test execution times and optimize as needed