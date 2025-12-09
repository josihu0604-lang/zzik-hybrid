import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Payment Integration
 * Tests Z-Point wallet, transactions, and payment methods
 */

test.describe('Payment Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo page with payment section
    await page.goto('/demo#payment');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Z-Point Wallet', () => {
    test('should display wallet balance', async ({ page }) => {
      const walletSection = page.locator('[data-testid="wallet-section"]');
      await expect(walletSection).toBeVisible();

      // Check balance display
      const balance = page.locator('[data-testid="wallet-balance"]');
      await expect(balance).toBeVisible();

      // Verify it's a number
      const balanceText = await balance.textContent();
      const balanceNum = balanceText?.replace(/[^\d]/g, '');
      expect(Number(balanceNum)).toBeGreaterThanOrEqual(0);
    });

    test('should display wallet address', async ({ page }) => {
      const walletAddress = page.locator('[data-testid="wallet-address"]');
      await expect(walletAddress).toBeVisible();

      // Verify address format
      const address = await walletAddress.textContent();
      expect(address).toMatch(/0x[a-fA-F0-9]+/);
    });

    test('should copy wallet address to clipboard', async ({ page }) => {
      // Click copy button
      const copyButton = page.locator('[data-testid="copy-address"]');
      await copyButton.click();

      // Wait for success message
      const successToast = page.locator('[data-testid="copy-success"]');
      await expect(successToast).toBeVisible({ timeout: 2000 });
    });

    test('should display pending balance', async ({ page }) => {
      const pendingBalance = page.locator('[data-testid="pending-balance"]');
      
      if (await pendingBalance.isVisible()) {
        const pending = await pendingBalance.textContent();
        const pendingNum = pending?.replace(/[^\d]/g, '');
        expect(Number(pendingNum)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Charge Z-Points', () => {
    test('should open charge modal', async ({ page }) => {
      const chargeButton = page.locator('[data-testid="charge-button"]');
      await chargeButton.click();

      // Wait for modal
      const chargeModal = page.locator('[data-testid="charge-modal"]');
      await expect(chargeModal).toBeVisible();
    });

    test('should display charge amount options', async ({ page }) => {
      const chargeButton = page.locator('[data-testid="charge-button"]');
      await chargeButton.click();

      // Check for preset amounts
      const amountOptions = page.locator('[data-testid="amount-option"]');
      const count = await amountOptions.count();
      expect(count).toBeGreaterThan(0);

      // Verify amounts are valid
      for (let i = 0; i < count; i++) {
        const option = amountOptions.nth(i);
        const amount = await option.textContent();
        const amountNum = amount?.replace(/[^\d]/g, '');
        expect(Number(amountNum)).toBeGreaterThan(0);
      }
    });

    test('should allow custom amount input', async ({ page }) => {
      const chargeButton = page.locator('[data-testid="charge-button"]');
      await chargeButton.click();

      // Find custom amount input
      const customInput = page.locator('[data-testid="custom-amount-input"]');
      await expect(customInput).toBeVisible();

      // Enter custom amount
      await customInput.fill('50000');

      // Verify input accepted
      const value = await customInput.inputValue();
      expect(value).toBe('50000');
    });

    test('should validate minimum charge amount', async ({ page }) => {
      const chargeButton = page.locator('[data-testid="charge-button"]');
      await chargeButton.click();

      // Enter amount below minimum
      const customInput = page.locator('[data-testid="custom-amount-input"]');
      await customInput.fill('100');

      // Try to proceed
      const proceedButton = page.locator('[data-testid="proceed-charge"]');
      await proceedButton.click();

      // Check for validation error
      const errorMessage = page.locator('[data-testid="amount-error"]');
      await expect(errorMessage).toBeVisible();
    });

    test('should display payment method selection', async ({ page }) => {
      const chargeButton = page.locator('[data-testid="charge-button"]');
      await chargeButton.click();

      // Select amount
      const firstOption = page.locator('[data-testid="amount-option"]').first();
      await firstOption.click();

      // Check payment methods
      const paymentMethods = page.locator('[data-testid="payment-method"]');
      const count = await paymentMethods.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should complete charge flow', async ({ page }) => {
      const chargeButton = page.locator('[data-testid="charge-button"]');
      await chargeButton.click();

      // Select amount
      const firstOption = page.locator('[data-testid="amount-option"]').first();
      await firstOption.click();

      // Select payment method
      const firstPaymentMethod = page.locator('[data-testid="payment-method"]').first();
      await firstPaymentMethod.click();

      // Proceed to payment
      const confirmButton = page.locator('[data-testid="confirm-charge"]');
      await confirmButton.click();

      // Wait for processing or success (in demo mode)
      await page.waitForTimeout(1000);

      // Should show success or redirect to payment gateway
      const success = page.locator('[data-testid="charge-success"]');
      const processing = page.locator('[data-testid="payment-processing"]');
      
      const successVisible = await success.isVisible();
      const processingVisible = await processing.isVisible();
      expect(successVisible || processingVisible).toBe(true);
    });
  });

  test.describe('Transaction History', () => {
    test('should display transaction history', async ({ page }) => {
      // Navigate to transactions tab
      const transactionsTab = page.locator('[data-testid="transactions-tab"]');
      await transactionsTab.click();

      // Wait for list
      const transactionsList = page.locator('[data-testid="transactions-list"]');
      await expect(transactionsList).toBeVisible();

      // Check for transaction items
      const transactions = page.locator('[data-testid="transaction-item"]');
      const count = await transactions.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display transaction details', async ({ page }) => {
      const transactionsTab = page.locator('[data-testid="transactions-tab"]');
      await transactionsTab.click();

      // Find first transaction
      const firstTransaction = page.locator('[data-testid="transaction-item"]').first();
      
      if (await firstTransaction.isVisible()) {
        // Verify transaction info
        await expect(firstTransaction.locator('[data-testid="transaction-type"]')).toBeVisible();
        await expect(firstTransaction.locator('[data-testid="transaction-amount"]')).toBeVisible();
        await expect(firstTransaction.locator('[data-testid="transaction-date"]')).toBeVisible();
        await expect(firstTransaction.locator('[data-testid="transaction-status"]')).toBeVisible();
      }
    });

    test('should filter transactions by type', async ({ page }) => {
      const transactionsTab = page.locator('[data-testid="transactions-tab"]');
      await transactionsTab.click();

      // Select filter
      const filterSelect = page.locator('[data-testid="transaction-filter"]');
      await filterSelect.selectOption('charge');

      // Wait for filter
      await page.waitForTimeout(500);

      // Verify filtered results
      const transactions = page.locator('[data-testid="transaction-item"]');
      const count = await transactions.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const transaction = transactions.nth(i);
          const type = await transaction.locator('[data-testid="transaction-type"]').textContent();
          expect(type).toContain('충전');
        }
      }
    });

    test('should search transactions', async ({ page }) => {
      const transactionsTab = page.locator('[data-testid="transactions-tab"]');
      await transactionsTab.click();

      // Use search
      const searchInput = page.locator('[data-testid="transaction-search"]');
      await searchInput.fill('충전');

      // Wait for search
      await page.waitForTimeout(500);

      // Verify search results
      const transactions = page.locator('[data-testid="transaction-item"]');
      const count = await transactions.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display transaction receipt', async ({ page }) => {
      const transactionsTab = page.locator('[data-testid="transactions-tab"]');
      await transactionsTab.click();

      // Find transaction with receipt
      const firstTransaction = page.locator('[data-testid="transaction-item"]').first();
      
      if (await firstTransaction.isVisible()) {
        // Click to view details
        await firstTransaction.click();

        // Wait for receipt modal
        const receiptModal = page.locator('[data-testid="receipt-modal"]');
        await expect(receiptModal).toBeVisible({ timeout: 2000 });

        // Verify receipt content
        await expect(page.locator('[data-testid="receipt-id"]')).toBeVisible();
        await expect(page.locator('[data-testid="receipt-amount"]')).toBeVisible();
        await expect(page.locator('[data-testid="receipt-date"]')).toBeVisible();
      }
    });
  });

  test.describe('Payment Methods', () => {
    test('should display saved payment methods', async ({ page }) => {
      // Navigate to payment methods tab
      const methodsTab = page.locator('[data-testid="payment-methods-tab"]');
      await methodsTab.click();

      // Wait for list
      const methodsList = page.locator('[data-testid="payment-methods-list"]');
      await expect(methodsList).toBeVisible();

      // Check for saved methods
      const methods = page.locator('[data-testid="payment-method-item"]');
      const count = await methods.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should add new payment method', async ({ page }) => {
      const methodsTab = page.locator('[data-testid="payment-methods-tab"]');
      await methodsTab.click();

      // Click add button
      const addButton = page.locator('[data-testid="add-payment-method"]');
      await addButton.click();

      // Wait for form
      const addModal = page.locator('[data-testid="add-payment-modal"]');
      await expect(addModal).toBeVisible();

      // Select payment type
      const cardOption = page.locator('[data-testid="payment-type-card"]');
      await cardOption.click();

      // Fill card details (test mode)
      await page.locator('[data-testid="card-number"]').fill('4242424242424242');
      await page.locator('[data-testid="card-expiry"]').fill('12/25');
      await page.locator('[data-testid="card-cvc"]').fill('123');

      // Submit
      const submitButton = page.locator('[data-testid="submit-payment-method"]');
      await submitButton.click();

      // Wait for success
      await page.waitForTimeout(1000);
      const success = page.locator('[data-testid="method-added-success"]');
      await expect(success).toBeVisible({ timeout: 3000 });
    });

    test('should set default payment method', async ({ page }) => {
      const methodsTab = page.locator('[data-testid="payment-methods-tab"]');
      await methodsTab.click();

      // Find non-default method
      const methods = page.locator('[data-testid="payment-method-item"]');
      const count = await methods.count();

      if (count > 1) {
        const secondMethod = methods.nth(1);
        
        // Click set as default
        const setDefaultButton = secondMethod.locator('[data-testid="set-default"]');
        await setDefaultButton.click();

        // Wait for update
        await page.waitForTimeout(500);

        // Verify it's now default
        await expect(secondMethod).toHaveAttribute('data-default', 'true');
      }
    });

    test('should delete payment method', async ({ page }) => {
      const methodsTab = page.locator('[data-testid="payment-methods-tab"]');
      await methodsTab.click();

      const methods = page.locator('[data-testid="payment-method-item"]');
      const initialCount = await methods.count();

      if (initialCount > 0) {
        // Find non-default method to delete
        const methodToDelete = methods.last();
        
        // Click delete
        const deleteButton = methodToDelete.locator('[data-testid="delete-method"]');
        await deleteButton.click();

        // Confirm deletion
        const confirmButton = page.locator('[data-testid="confirm-delete"]');
        await confirmButton.click();

        // Wait for deletion
        await page.waitForTimeout(500);

        // Verify count decreased
        const newCount = await methods.count();
        expect(newCount).toBe(initialCount - 1);
      }
    });
  });

  test.describe('Spending and Usage', () => {
    test('should spend Z-Points', async ({ page }) => {
      const initialBalance = await page.locator('[data-testid="wallet-balance"]').textContent();
      const initialNum = initialBalance?.replace(/[^\d]/g, '') || '0';

      // Click spend button (demo)
      const spendButton = page.locator('[data-testid="spend-points-demo"]');
      await spendButton.click();

      // Enter spend amount
      const amountInput = page.locator('[data-testid="spend-amount"]');
      await amountInput.fill('1000');

      // Confirm spend
      const confirmButton = page.locator('[data-testid="confirm-spend"]');
      await confirmButton.click();

      // Wait for transaction
      await page.waitForTimeout(1000);

      // Verify balance decreased
      const newBalance = await page.locator('[data-testid="wallet-balance"]').textContent();
      const newNum = newBalance?.replace(/[^\d]/g, '') || '0';
      expect(Number(newNum)).toBeLessThan(Number(initialNum));
    });

    test('should display spending statistics', async ({ page }) => {
      const statsTab = page.locator('[data-testid="stats-tab"]');
      await statsTab.click();

      // Check for spending chart
      const spendingChart = page.locator('[data-testid="spending-chart"]');
      await expect(spendingChart).toBeVisible();

      // Check for spending categories
      const categories = page.locator('[data-testid="spending-category"]');
      const count = await categories.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should set spending limit', async ({ page }) => {
      const settingsTab = page.locator('[data-testid="payment-settings-tab"]');
      await settingsTab.click();

      // Find spending limit input
      const limitInput = page.locator('[data-testid="spending-limit"]');
      await limitInput.fill('100000');

      // Save settings
      const saveButton = page.locator('[data-testid="save-settings"]');
      await saveButton.click();

      // Verify saved
      const successMessage = page.locator('[data-testid="settings-saved"]');
      await expect(successMessage).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display wallet on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to payment section
      await page.goto('/demo#payment');

      // Verify mobile layout
      const walletSection = page.locator('[data-testid="wallet-section"]');
      await expect(walletSection).toBeVisible();

      // Check that elements fit mobile width
      const boundingBox = await walletSection.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400);
    });

    test('should have mobile-friendly charge flow', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const chargeButton = page.locator('[data-testid="charge-button"]');
      await chargeButton.click();

      // Verify modal fits mobile
      const chargeModal = page.locator('[data-testid="charge-modal"]');
      await expect(chargeModal).toBeVisible();

      const modalBox = await chargeModal.boundingBox();
      expect(modalBox?.width).toBeLessThan(400);
    });
  });
});
