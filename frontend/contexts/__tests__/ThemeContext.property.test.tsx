/**
 * Property-Based Tests for ThemeContext
 * Feature: theme-switcher
 * Validates: Requirements 1.1, 2.4, 3.1, 3.2, 1.4
 */

import { renderHook, waitFor, act, render } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider, useTheme } from '../ThemeContext';
import React from 'react';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('ThemeContext Property Tests', () => {
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

  /**
   * Property 1: System preference detection
   * For any system color scheme preference (light or dark), when the application loads
   * without a stored preference, the resolved theme should match the system preference.
   */
  it('Property 1: System preference detection - resolved theme matches system preference when no stored preference exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // Generate random system preference (true = dark, false = light)
        async (isDarkMode) => {
          // Clear localStorage to ensure no stored preference
          localStorage.clear();

          // Mock window.matchMedia to return the generated system preference
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: isDarkMode,
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

          // Render the hook with ThemeProvider
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
          );

          const { result } = renderHook(() => useTheme(), { wrapper });

          // The expected resolved theme based on system preference
          const expectedResolvedTheme = isDarkMode ? 'dark' : 'light';

          // Wait for effects to complete and verify the resolved theme matches system preference
          await waitFor(() => {
            expect(result.current.resolvedTheme).toBe(expectedResolvedTheme);
          }, { timeout: 1000 });

          // Property holds: resolved theme matches system preference
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
   * Feature: theme-switcher, Property 4: Manual selection overrides system
   * Validates: Requirements 2.4
   * 
   * Property 4: Manual selection overrides system
   * For any system preference and any manually selected theme, the resolved theme
   * should match the manual selection, not the system preference.
   */
  it('Property 4: Manual selection overrides system - resolved theme matches manual selection regardless of system preference', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // Generate random system preference (true = dark, false = light)
        fc.constantFrom('light' as const, 'dark' as const), // Generate random manual selection
        async (systemIsDark, manualSelection) => {
          // Clear localStorage before test
          localStorage.clear();

          // Mock window.matchMedia to return the generated system preference
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: systemIsDark,
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

          // Render the hook with ThemeProvider
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
          );

          const { result } = renderHook(() => useTheme(), { wrapper });

          // Wait for initial render to complete
          await waitFor(() => {
            expect(result.current).toBeDefined();
          });

          // Manually set the theme wrapped in act
          await act(async () => {
            result.current.setTheme(manualSelection);
          });

          // Wait for the theme to be applied
          await waitFor(() => {
            expect(result.current.theme).toBe(manualSelection);
            expect(result.current.resolvedTheme).toBe(manualSelection);
          }, { timeout: 1000 });

          // Verify that the manual selection overrides system preference
          // If system is dark but manual is light, resolved should be light
          // If system is light but manual is dark, resolved should be dark
          const systemTheme = systemIsDark ? 'dark' : 'light';
          if (manualSelection !== systemTheme) {
            // When manual selection differs from system, it should override
            expect(result.current.resolvedTheme).toBe(manualSelection);
            expect(result.current.resolvedTheme).not.toBe(systemTheme);
          }

          // Property holds: resolved theme matches manual selection
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
   * Feature: theme-switcher, Property 5: Theme persistence round-trip
   * Validates: Requirements 3.1, 3.2
   * 
   * Property 5: Theme persistence round-trip
   * For any manually selected theme, storing it to localStorage and then retrieving it
   * should result in the same theme value.
   */
  it('Property 5: Theme persistence round-trip - stored theme matches retrieved theme', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const, 'system' as const), // Generate random theme value
        async (themeValue) => {
          // Clear localStorage before test
          localStorage.clear();

          // Mock window.matchMedia for system theme detection
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: false, // Default to light for consistency
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

          // Render the hook with ThemeProvider
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
          );

          const { result } = renderHook(() => useTheme(), { wrapper });

          // Wait for initial render to complete
          await waitFor(() => {
            expect(result.current).toBeDefined();
          });

          // Set the theme (this should store it to localStorage)
          await act(async () => {
            result.current.setTheme(themeValue);
          });

          // Wait for the theme to be applied and stored
          await waitFor(() => {
            expect(result.current.theme).toBe(themeValue);
          }, { timeout: 1000 });

          // Retrieve the stored theme from localStorage
          const storedTheme = localStorage.getItem('theme-preference');

          // Property holds: stored theme matches the theme we set
          expect(storedTheme).toBe(themeValue);

          // Additional verification: unmount and remount to test retrieval
          const { result: result2 } = renderHook(() => useTheme(), { wrapper });

          // Wait for the new instance to load the stored theme
          await waitFor(() => {
            expect(result2.current.theme).toBe(themeValue);
          }, { timeout: 1000 });

          // Property holds: retrieved theme matches original theme (round-trip)
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
   * Feature: theme-switcher, Property 8: Context reactivity
   * Validates: Requirements 5.3
   * 
   * Property 8: Context reactivity
   * For any set of components subscribed to ThemeContext, when the theme changes,
   * all subscribed components should receive the updated theme state.
   */
  it('Property 8: Context reactivity - all subscribed components receive updated theme state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const, 'system' as const), // Generate random theme change
        async (newTheme) => {
          // Clear localStorage before test
          localStorage.clear();

          // Mock window.matchMedia for system theme detection
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: false, // Default to light for consistency
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

          // Track theme values from multiple components
          let component1Theme: string | null = null;
          let component2Theme: string | null = null;
          let component3Theme: string | null = null;
          let component1Resolved: string | null = null;
          let component2Resolved: string | null = null;
          let component3Resolved: string | null = null;

          const TestComponent1 = () => {
            const { theme, resolvedTheme } = useTheme();
            component1Theme = theme;
            component1Resolved = resolvedTheme;
            return null;
          };

          const TestComponent2 = () => {
            const { theme, resolvedTheme } = useTheme();
            component2Theme = theme;
            component2Resolved = resolvedTheme;
            return null;
          };

          const TestComponent3 = () => {
            const { theme, resolvedTheme } = useTheme();
            component3Theme = theme;
            component3Resolved = resolvedTheme;
            return null;
          };

          // Render the provider with multiple subscribed components
          const { rerender } = render(
            <ThemeProvider>
              <TestComponent1 />
              <TestComponent2 />
              <TestComponent3 />
            </ThemeProvider>
          );

          // Wait for initial render
          await waitFor(() => {
            expect(component1Theme).not.toBeNull();
            expect(component2Theme).not.toBeNull();
            expect(component3Theme).not.toBeNull();
          }, { timeout: 1000 });

          // Verify all components have the same initial state
          expect(component1Theme).toBe(component2Theme);
          expect(component2Theme).toBe(component3Theme);
          expect(component1Resolved).toBe(component2Resolved);
          expect(component2Resolved).toBe(component3Resolved);

          // Now create a component that will change the theme
          const ThemeChanger = () => {
            const { setTheme } = useTheme();
            React.useEffect(() => {
              setTheme(newTheme);
            }, [setTheme]);
            return null;
          };

          // Re-render with the theme changer
          await act(async () => {
            rerender(
              <ThemeProvider>
                <ThemeChanger />
                <TestComponent1 />
                <TestComponent2 />
                <TestComponent3 />
              </ThemeProvider>
            );
          });

          // Wait for theme change to propagate
          await waitFor(() => {
            expect(component1Theme).toBe(newTheme);
          }, { timeout: 1000 });

          // Property holds: all subscribed components have the same updated theme state
          expect(component1Theme).toBe(newTheme);
          expect(component2Theme).toBe(newTheme);
          expect(component3Theme).toBe(newTheme);
          
          // All components should have the same resolved theme
          expect(component1Resolved).toBe(component2Resolved);
          expect(component2Resolved).toBe(component3Resolved);

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
   * Feature: theme-switcher, Property 7: Context provides theme state
   * Validates: Requirements 5.1, 5.2
   * 
   * Property 7: Context provides theme state
   * For any component consuming the ThemeContext, the context should provide
   * the current theme state and toggle function.
   */
  it('Property 7: Context provides theme state - context provides correct state and functions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const, 'system' as const), // Generate random theme value
        async (initialTheme) => {
          // Clear localStorage before test
          localStorage.clear();

          // Mock window.matchMedia for system theme detection
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: false, // Default to light for consistency
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

          // Render the hook with ThemeProvider
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
          );

          const { result } = renderHook(() => useTheme(), { wrapper });

          // Wait for initial render to complete
          await waitFor(() => {
            expect(result.current).toBeDefined();
          });

          // Property Part 1: Verify context provides theme state (Requirement 5.1)
          expect(result.current.theme).toBeDefined();
          expect(result.current.resolvedTheme).toBeDefined();
          expect(['light', 'dark', 'system']).toContain(result.current.theme);
          expect(['light', 'dark']).toContain(result.current.resolvedTheme);

          // Property Part 2: Verify context provides toggle function (Requirement 5.2)
          expect(result.current.setTheme).toBeDefined();
          expect(typeof result.current.setTheme).toBe('function');
          expect(result.current.toggleTheme).toBeDefined();
          expect(typeof result.current.toggleTheme).toBe('function');

          // Verify setTheme function works correctly
          await act(async () => {
            result.current.setTheme(initialTheme);
          });

          await waitFor(() => {
            expect(result.current.theme).toBe(initialTheme);
          }, { timeout: 1000 });

          // Verify toggleTheme function works correctly
          const themeBeforeToggle = result.current.resolvedTheme;
          
          await act(async () => {
            result.current.toggleTheme();
          });

          await waitFor(() => {
            // After toggle, resolved theme should be opposite
            const expectedTheme = themeBeforeToggle === 'dark' ? 'light' : 'dark';
            expect(result.current.resolvedTheme).toBe(expectedTheme);
          }, { timeout: 1000 });

          // Property holds: context provides all required state and functions
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
   * Feature: theme-switcher, Property 11: System preference change reactivity
   * Validates: Requirements 1.4
   * 
   * Property 11: System preference change reactivity
   * For any initial system preference, when the system preference changes and no manual
   * preference is stored, the resolved theme should update to match the new system preference.
   */
  it('Property 11: System preference change reactivity - resolved theme updates when system preference changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // Generate random initial system preference (true = dark, false = light)
        async (initialIsDark) => {
          // Clear localStorage to ensure no stored preference
          localStorage.clear();

          // Create a mutable reference to track the current system preference
          let currentSystemIsDark = initialIsDark;
          let changeListener: ((e: MediaQueryListEvent) => void) | null = null;

          // Mock window.matchMedia with ability to trigger change events
          const mockMatchMedia = jest.fn((query: string) => {
            if (query === '(prefers-color-scheme: dark)') {
              return {
                matches: currentSystemIsDark,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn((event: string, listener: any) => {
                  if (event === 'change') {
                    changeListener = listener;
                  }
                }),
                removeEventListener: jest.fn((event: string) => {
                  if (event === 'change') {
                    changeListener = null;
                  }
                }),
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

          // Render the hook with ThemeProvider
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
          );

          const { result } = renderHook(() => useTheme(), { wrapper });

          // Wait for initial render and verify initial system preference is detected
          const initialExpectedTheme = initialIsDark ? 'dark' : 'light';
          await waitFor(() => {
            expect(result.current.resolvedTheme).toBe(initialExpectedTheme);
            expect(result.current.theme).toBe('system'); // Should be 'system' since no manual preference
          }, { timeout: 1000 });

          // Now simulate a system preference change to the opposite value
          const newSystemIsDark = !initialIsDark;
          currentSystemIsDark = newSystemIsDark;

          // Trigger the change event if listener was registered
          if (changeListener) {
            await act(async () => {
              changeListener({
                matches: newSystemIsDark,
                media: '(prefers-color-scheme: dark)',
              } as MediaQueryListEvent);
            });

            // Wait for the resolved theme to update
            const newExpectedTheme = newSystemIsDark ? 'dark' : 'light';
            await waitFor(() => {
              expect(result.current.resolvedTheme).toBe(newExpectedTheme);
            }, { timeout: 1000 });

            // Property holds: resolved theme updated to match new system preference
            expect(result.current.theme).toBe('system'); // Should still be 'system'
            expect(result.current.resolvedTheme).toBe(newExpectedTheme);
          }

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
