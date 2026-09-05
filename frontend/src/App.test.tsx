import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('SkyHaven Frontend Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/airports')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              { id: '1', code: 'DEL', cityName: 'New Delhi', country: 'India', name: 'Indira Gandhi Intl' },
              { id: '2', code: 'BOM', cityName: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Intl' },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });
    }));
  });

  it('renders application brand title', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/SkyHaven/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });
});
