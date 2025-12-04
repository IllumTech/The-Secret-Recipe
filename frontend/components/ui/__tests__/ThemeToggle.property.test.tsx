/**
 * Property-Based Tests for ThemeToggle Component
 * Feature: theme-switcher
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';

describe('ThemeToggle Property Tests', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeAll(() => {
    // Save original matchMedia
    originalMatchMedia = window.matchMedia;
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove any dark class from document
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  // Set timeout for all tests in this suite (property tests need more time)
  jest.setTimeout(30000);

  /**
   * Feature: theme-switcher, Property 2: Theme toggle icon consistency
   * Validates: Requirements 2.1, 2.3
   * 
   * Property 2: Theme toggle icon consistency
   * For any theme state (light or dark), the theme toggle button should display
   * the icon corresponding to the opposite theme (moon icon in light mode, sun icon in dark mode).
   */
  it('Property 2: Theme toggle icon consistency - displays opposite icon for current theme', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const), // Generate random resolved theme
        async (resolvedTheme) => {
          // Clear localStorage before test
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          // Mock window.matchMedia to set the system preference to match our desired resolved theme
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: resolvedTheme === 'dark',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
              } as MediaQueryList;
            }
            return {
              matches: false,
              media: query,
              onchange: null,
              addListener: jest.fn(),
              removeListener: jest.fn(),
              addEventListener: jest.fn(),
              removeEventListener: jest.fn(),
              dispatchEvent: jest.fn(),
            } as MediaQueryList;
          });

          window.matchMedia = mockMatchMedia;

          // Render ThemeToggle with ThemeProvider
          const { container, unmount } = render(
            <ThemeProvider>
              <ThemeToggle />
            </ThemeProvider>
          );

          // Wait a bit for the theme to be applied
          await new Promise(resolve => setTimeout(resolve, 100));

          // Get the button element - use container.querySelector to avoid multiple element issues
          const button = container.querySelector('button[aria-label*="Switch to"]');

          expect(button).toBeInTheDocument();

          // Check the aria-label to verify it suggests switching to the opposite theme
          const ariaLabel = button?.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();

          if (resolvedTheme === 'dark') {
            // When in dark mode, button should suggest switching to light mode
            expect(ariaLabel).toContain('light');
            // And should display Sun icon (which means switching TO light)
            // The Sun icon is rendered when resolvedTheme is 'dark'
            const svgElement = container.querySelector('svg');
            expect(svgElement).toBeInTheDocument();
          } else {
            // When in light mode, button should suggest switching to dark mode
            expect(ariaLabel).toContain('dark');
            // And should display Moon icon (which means switching TO dark)
            // The Moon icon is rendered when resolvedTheme is 'light'
            const svgElement = container.querySelector('svg');
            expect(svgElement).toBeInTheDocument();
          }

          // Verify aria-pressed attribute matches the current theme
          const ariaPressed = button?.getAttribute('aria-pressed');
          if (resolvedTheme === 'dark') {
            expect(ariaPressed).toBe('true');
          } else {
            expect(ariaPressed).toBe('false');
          }

          // Clean up after each iteration
          unmount();
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          // Property holds: icon and label are consistent with opposite theme
          return true;
        }
      ),
      {
        numRuns: 100, // Run 100 iterations as specified in design doc
        verbose: true,
      }
    );
  });

  /**
   * Feature: theme-switcher, Property 3: Theme toggle switches state
   * Validates: Requirements 2.2
   * 
   * Property 3: Theme toggle switches state
   * For any current theme state, clicking the theme toggle button should change
   * the theme to the opposite state.
   */
  it('Property 3: Theme toggle switches state - clicking toggles to opposite theme', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const), // Generate random initial resolved theme
        async (initialResolvedTheme) => {
          // Clear localStorage before test
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          // Mock window.matchMedia to set the system preference to match our desired initial resolved theme
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: initialResolvedTheme === 'dark',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
              } as MediaQueryList;
            }
            return {
              matches: false,
              media: query,
              onchange: null,
              addListener: jest.fn(),
              removeListener: jest.fn(),
              addEventListener: jest.fn(),
              removeEventListener: jest.fn(),
              dispatchEvent: jest.fn(),
            } as MediaQueryList;
          });

          window.matchMedia = mockMatchMedia;

          // Render ThemeToggle with ThemeProvider
          const { container, unmount } = render(
            <ThemeProvider>
              <ThemeToggle />
            </ThemeProvider>
          );

          // Wait for the initial theme to be applied
          await new Promise(resolve => setTimeout(resolve, 100));

          // Get the button element
          const button = container.querySelector('button[aria-label*="Switch to"]');
          expect(button).toBeInTheDocument();

          // Verify initial state
          const initialAriaPressed = button?.getAttribute('aria-pressed');
          const expectedInitialPressed = initialResolvedTheme === 'dark' ? 'true' : 'false';
          expect(initialAriaPressed).toBe(expectedInitialPressed);

          // Verify initial document class
          const initialHasDarkClass = document.documentElement.classList.contains('dark');
          expect(initialHasDarkClass).toBe(initialResolvedTheme === 'dark');

          // Click the toggle button
          if (button) {
            fireEvent.click(button);
          }

          // Wait for the theme change to be applied
          await new Promise(resolve => setTimeout(resolve, 100));

          // Verify the theme has switched to the opposite state
          const afterClickAriaPressed = button?.getAttribute('aria-pressed');
          const expectedAfterClickPressed = initialResolvedTheme === 'dark' ? 'false' : 'true';
          expect(afterClickAriaPressed).toBe(expectedAfterClickPressed);

          // Verify document class has changed
          const afterClickHasDarkClass = document.documentElement.classList.contains('dark');
          expect(afterClickHasDarkClass).toBe(initialResolvedTheme === 'light');

          // Verify the aria-label has changed to suggest switching back
          const afterClickAriaLabel = button?.getAttribute('aria-label');
          if (initialResolvedTheme === 'dark') {
            // Was dark, now should be light, so label should suggest switching to dark
            expect(afterClickAriaLabel).toContain('dark');
          } else {
            // Was light, now should be dark, so label should suggest switching to light
            expect(afterClickAriaLabel).toContain('light');
          }

          // Clean up after each iteration
          unmount();
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          // Property holds: clicking the toggle switches to the opposite theme
          return true;
        }
      ),
      {
        numRuns: 100, // Run 100 iterations as specified in design doc
        verbose: true,
      }
    );
  });
});
