/**
 * Unit Tests for ThemeToggle Component
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';

describe('ThemeToggle Unit Tests', () => {
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
   * Test: Correct icon renders based on theme
   * Requirement 2.1: Display theme toggle button with appropriate icon
   * Requirement 2.3: Update icon to reflect current theme state
   */
  it('renders Sun icon when theme is dark', async () => {
    mockMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();

    // Sun icon should be present (lucide-react renders as svg)
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders Moon icon when theme is light', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();

    // Moon icon should be present (lucide-react renders as svg)
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  /**
   * Test: Click handler is called
   * Requirement 2.2: Switch to opposite theme when clicked
   */
  it('toggles theme when clicked', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    
    // Initial state: light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle
    fireEvent.click(button);

    await new Promise(resolve => setTimeout(resolve, 100));

    // After click: dark mode
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  /**
   * Test: Accessibility attributes are present
   * Requirement 2.1: Display theme toggle button
   * Requirement 2.3: Update icon to reflect current theme state
   */
  it('has proper aria-label attribute', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const button = screen.getByRole('button');
    const ariaLabel = button.getAttribute('aria-label');
    
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Switch to');
    expect(ariaLabel).toContain('mode');
  });

  it('has proper aria-pressed attribute for light theme', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('has proper aria-pressed attribute for dark theme', async () => {
    mockMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('has screen reader text', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const srText = document.querySelector('.sr-only');
    expect(srText).toBeInTheDocument();
    expect(srText?.textContent).toContain('Switch to');
  });

  it('has proper button type attribute', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('button');
  });
});
