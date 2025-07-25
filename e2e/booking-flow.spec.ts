import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('create booking via wizard', async ({ page }) => {
    await page.goto('/bookings-v3/wizard');
    await page.fill('[data-testid="client-search"]', 'New Client');
    await page.click('[data-testid="create-new-client"]');
    await page.fill('[data-testid="client-firstname"]', 'John');
    await page.fill('[data-testid="client-lastname"]', 'Doe');
    await page.fill('[data-testid="client-email"]', 'john@example.com');
    await page.click('[data-testid="next-step"]');
    await page.click('[data-testid="course-1"]');
    await page.click('[data-testid="next-step"]');
    await page.click('[data-testid="calendar-date-tomorrow"]');
    await page.click('[data-testid="timeslot-morning"]');
    await page.click('[data-testid="next-step"]');
    await page.fill('[data-testid="participant-firstname-0"]', 'John');
    await page.fill('[data-testid="participant-lastname-0"]', 'Doe');
    await page.fill('[data-testid="participant-age-0"]', '25');
    await page.selectOption('[data-testid="participant-level-0"]', 'beginner');
    await page.click('[data-testid="next-step"]');
    await page.click('[data-testid="accept-terms"]');
    await page.click('[data-testid="next-step"]');
    await page.click('[data-testid="create-booking"]');
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
  });

  test('cancel booking from list', async ({ page }) => {
    await page.goto('/bookings-v3/skipro');
    await page.click('[data-testid="booking-row-0"] [data-testid="open-actions"]');
    await page.click('[data-testid="cancel-booking"]');
    await page.fill('[data-testid="cancel-reason"]', 'mistake');
    await page.click('[data-testid="confirm-cancel"]');
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});
