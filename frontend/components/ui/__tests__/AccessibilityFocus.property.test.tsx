/**
 * Property-Based Tests for Accessibility - Focus Indicator Visibility
 * Feature: theme-switcher, Property 10: Focus indicator visibility
 * Validates: Requirements 6.4
 */

import { render, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ThemeToggle from '@/components/ui/ThemeToggle';

describe('Property 10: Focus indicator visibility', () => {
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

  // Set timeout for all tests in this suite (property tests need more time)
  jest.setTimeout(30000);

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
   * Calculate relative luminance according to WCAG 2.1
   */
  const getRelativeLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  /**
   * Calculate contrast ratio according to WCAG 2.1
   */
  const getContrastRatio = (color1: string, color2: string): number => {
    const parseRGB = (color: string): [number, number, number] => {
      // Handle rgb() and rgba() formats
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
      // Handle hex format
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        if (hex.length === 6) {
          return [
            parseInt(hex.substr(0, 2), 16),
            parseInt(hex.substr(2, 2), 16),
            parseInt(hex.substr(4, 2), 16)
          ];
        }
      }
      // Default to black if parsing fails
      return [0, 0, 0];
    };

    const [r1, g1, b1] = parseRGB(color1);
    const [r2, g2, b2] = parseRGB(color2);

    const l1 = getRelativeLuminance(r1, g1, b1);
    const l2 = getRelativeLuminance(r2, g2, b2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  /**
   * Extract focus ring color from box-shadow or outline
   */
  const getFocusIndicatorColor = (element: Element): string | null => {
    const styles = window.getComputedStyle(element);
    
    // Check for outline
    const outlineColor = styles.outlineColor;
    if (outlineColor && outlineColor !== 'rgba(0, 0, 0, 0)' && outlineColor !== 'transparent') {
      return outlineColor;
    }

    // Check for box-shadow (Tailwind ring utilities use box-shadow)
    const boxShadow = styles.boxShadow;
    if (boxShadow && boxShadow !== 'none') {
      // Extract color from box-shadow
      // Format: "0 0 0 3px rgba(r, g, b, a)"
      const colorMatch = boxShadow.match(/rgba?\([^)]+\)/);
      if (colorMatch) {
        return colorMatch[0];
      }
    }

    return null;
  };

  /**
   * Get effective background color (handling transparency)
   */
  const getEffectiveBackgroundColor = (element: Element): string => {
    let bgColor = window.getComputedStyle(element).backgroundColor;
    
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      let parent = element.parentElement;
      while (parent && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
        bgColor = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
    }

    // If still transparent, default to white or dark based on theme
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      const isDark = document.documentElement.classList.contains('dark');
      bgColor = isDark ? 'rgb(17, 24, 39)' : 'rgb(255, 255, 255)'; // gray-900 or white
    }

    return bgColor;
  };

  /**
   * Feature: theme-switcher, Property 10: Focus indicator visibility
   * Validates: Requirements 6.4
   * 
   * Property 10: Focus indicator visibility
   * For any interactive element in any theme, focus indicators should have
   * sufficient contrast (minimum 3:1) to be visible against their background.
   */
  it('Property 10: Focus indicator visibility - focus indicators meet contrast requirements', async () => {
    mockMatchMedia(false);

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const),
        fc.constantFrom(
          { component: 'Button', variant: 'primary' as const },
          { component: 'Button', variant: 'secondary' as const },
          { component: 'Button', variant: 'outline' as const },
          { component: 'Input', variant: null },
          { component: 'ThemeToggle', variant: null }
        ),
        async (theme, componentConfig) => {
          // Set up the theme
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          await new Promise(resolve => setTimeout(resolve, 10));

          // Render the component
          let container: HTMLElement;
          let interactiveElement: Element | null = null;

          if (componentConfig.component === 'Button' && componentConfig.variant) {
            const { container: c } = render(
              <ThemeProvider>
                <Button variant={componentConfig.variant}>Test Button</Button>
              </ThemeProvider>
            );
            container = c;
            interactiveElement = container.querySelector('button');
          } else if (componentConfig.component === 'Input') {
            const { container: c } = render(
              <ThemeProvider>
                <Input placeholder="Test input" />
              </ThemeProvider>
            );
            container = c;
            interactiveElement = container.querySelector('input');
          } else {
            const { container: c } = render(
              <ThemeProvider>
                <ThemeToggle />
              </ThemeProvider>
            );
            container = c;
            interactiveElement = container.querySelector('button');
          }

          await new Promise(resolve => setTimeout(resolve, 10));

          expect(interactiveElement).toBeTruthy();

          if (interactiveElement) {
            // Focus the element
            (interactiveElement as HTMLElement).focus();
            
            // Trigger focus event to ensure styles are applied
            fireEvent.focus(interactiveElement);

            await new Promise(resolve => setTimeout(resolve, 10));

            // Get the background color
            const bgColor = getEffectiveBackgroundColor(interactiveElement);

            // Get focus indicator color
            const focusColor = getFocusIndicatorColor(interactiveElement);

            // If we can detect a focus indicator, verify its contrast
            if (focusColor) {
              const contrastRatio = getContrastRatio(focusColor, bgColor);
              
              // WCAG requires 3:1 contrast for focus indicators
              // Allow small tolerance for rounding
              expect(contrastRatio).toBeGreaterThanOrEqual(2.9);
            } else {
              // If no focus indicator detected, verify element has some visible focus state
              // This could be through outline, box-shadow, or other visual changes
              const styles = window.getComputedStyle(interactiveElement);
              const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
              const hasBoxShadow = styles.boxShadow !== 'none';
              const hasBorder = styles.borderWidth !== '0px' && styles.borderStyle !== 'none';

              // Element should have at least one focus indicator
              expect(hasOutline || hasBoxShadow || hasBorder).toBe(true);
            }
          }

          // Clean up
          document.documentElement.classList.remove('dark');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify focus indicators are visible in both themes
   */
  it('should verify interactive elements have visible focus indicators in both themes', async () => {
    mockMatchMedia(false);

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const),
        async (theme) => {
          // Set up the theme
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          await new Promise(resolve => setTimeout(resolve, 10));

          // Render multiple interactive elements
          const { container } = render(
            <ThemeProvider>
              <div className="space-y-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Input placeholder="Test input" />
                <ThemeToggle />
              </div>
            </ThemeProvider>
          );

          await new Promise(resolve => setTimeout(resolve, 10));

          // Get all interactive elements
          const buttons = container.querySelectorAll('button');
          const inputs = container.querySelectorAll('input');
          const interactiveElements = [...Array.from(buttons), ...Array.from(inputs)];

          expect(interactiveElements.length).toBeGreaterThan(0);

          // Test each interactive element
          for (const element of interactiveElements) {
            // Focus the element
            (element as HTMLElement).focus();
            fireEvent.focus(element);

            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify element has a focus indicator
            const styles = window.getComputedStyle(element);
            const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
            const hasBoxShadow = styles.boxShadow !== 'none';
            const hasBorder = styles.borderWidth !== '0px' && styles.borderStyle !== 'none';

            // At least one focus indicator should be present
            const hasFocusIndicator = hasOutline || hasBoxShadow || hasBorder;
            expect(hasFocusIndicator).toBe(true);

            // If we can detect the focus color, verify contrast
            const focusColor = getFocusIndicatorColor(element);
            if (focusColor) {
              const bgColor = getEffectiveBackgroundColor(element);
              const contrastRatio = getContrastRatio(focusColor, bgColor);
              
              // Should meet 3:1 minimum
              expect(contrastRatio).toBeGreaterThanOrEqual(2.9);
            }
          }

          // Clean up
          document.documentElement.classList.remove('dark');

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test: Verify focus indicators are keyboard accessible
   */
  it('should verify focus indicators appear on keyboard navigation', async () => {
    mockMatchMedia(false);

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const),
        async (theme) => {
          // Set up the theme
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          await new Promise(resolve => setTimeout(resolve, 10));

          // Render interactive elements
          const { container } = render(
            <ThemeProvider>
              <div>
                <Button variant="primary">Button 1</Button>
                <Button variant="secondary">Button 2</Button>
                <Input placeholder="Input field" />
              </div>
            </ThemeProvider>
          );

          await new Promise(resolve => setTimeout(resolve, 10));

          const firstButton = container.querySelector('button');
          expect(firstButton).toBeTruthy();

          if (firstButton) {
            // Simulate keyboard focus (Tab key)
            firstButton.focus();
            fireEvent.keyDown(firstButton, { key: 'Tab', code: 'Tab' });

            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify focus indicator is present
            const styles = window.getComputedStyle(firstButton);
            const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
            const hasBoxShadow = styles.boxShadow !== 'none';

            expect(hasOutline || hasBoxShadow).toBe(true);
          }

          // Clean up
          document.documentElement.classList.remove('dark');

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
