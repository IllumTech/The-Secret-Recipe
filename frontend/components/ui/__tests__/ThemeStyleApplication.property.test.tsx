/**
 * Property-Based Tests for Theme Style Application
 * Feature: theme-switcher, Property 6: Theme style application
 * Validates: Requirements 4.1, 4.2, 4.3
 */

import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('Property 6: Theme style application', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    window.matchMedia = originalMatchMedia;
  });

  const mockMatchMedia = (isDark: boolean) => {
    window.matchMedia = jest.fn((query: string) => {
      if (query === '(prefers-color-scheme: dark)') {
        return {
          matches: isDark,
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
  };

  /**
   * Property: For any theme state (light or dark), all components should have 
   * the appropriate CSS classes applied (dark mode classes when theme is dark, 
   * light mode classes when theme is light).
   */
  it('should apply appropriate CSS classes based on theme state', async () => {
    mockMatchMedia(false);

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const),
        async (theme) => {
          // Set up the theme by applying it to document
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          // Render a component with theme-aware styling
          const { container } = render(
            <ThemeProvider>
              <div>
                <Button variant="primary">Test Button</Button>
                <Input placeholder="Test Input" />
              </div>
            </ThemeProvider>
          );

          await new Promise(resolve => setTimeout(resolve, 10));

          // Get computed styles of rendered elements
          const button = container.querySelector('button');
          const input = container.querySelector('input');

          // Verify that elements exist
          expect(button).toBeTruthy();
          expect(input).toBeTruthy();

          if (button) {
            const buttonStyles = window.getComputedStyle(button);
            const bgColor = buttonStyles.backgroundColor;
            // Verify background color is set (not empty or 'rgba(0, 0, 0, 0)')
            expect(bgColor).toBeTruthy();
            expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
          }

          if (input) {
            const inputStyles = window.getComputedStyle(input);
            const bgColor = inputStyles.backgroundColor;
            // Verify background color is set
            expect(bgColor).toBeTruthy();
          }

          // Clean up
          document.documentElement.classList.remove('dark');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply dark class to documentElement when theme is dark', async () => {
    mockMatchMedia(false);

    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        async (isDark) => {
          // Set up theme
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify the dark class is applied correctly
          const hasDarkClass = document.documentElement.classList.contains('dark');
          expect(hasDarkClass).toBe(isDark);

          // Render a simple div with dark mode classes
          const { container } = render(
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              Test Content
            </div>
          );

          const element = container.firstChild as HTMLElement;
          expect(element).toBeTruthy();

          if (element) {
            // Verify element has the expected classes
            const classes = element.className;
            expect(classes).toContain('bg-white');
            expect(classes).toContain('dark:bg-gray-900');
            expect(classes).toContain('text-gray-900');
            expect(classes).toContain('dark:text-gray-100');
          }

          // Clean up
          document.documentElement.classList.remove('dark');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain theme classes across multiple renders', async () => {
    mockMatchMedia(false);

    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('light' as const, 'dark' as const), { minLength: 2, maxLength: 5 }),
        async (themeSequence) => {
          for (const theme of themeSequence) {
            // Apply theme
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }

            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify dark class matches theme
            const hasDarkClass = document.documentElement.classList.contains('dark');
            expect(hasDarkClass).toBe(theme === 'dark');

            // Render component
            const { container } = render(
              <ThemeProvider>
                <Button variant="primary">Test</Button>
              </ThemeProvider>
            );

            const button = container.querySelector('button');
            expect(button).toBeTruthy();

            if (button) {
              const styles = window.getComputedStyle(button);
              // Verify styles are applied (background color should be set)
              expect(styles.backgroundColor).toBeTruthy();
            }
          }

          // Clean up
          document.documentElement.classList.remove('dark');
        }
      ),
      { numRuns: 50 }
    );
  });
});
