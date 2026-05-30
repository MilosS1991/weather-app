import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoriteChips } from './FavoriteChips';
import { DEFAULT_LOCATION } from '../api/openmeteo';
import type { UseFavoritesResult } from '../hooks/useFavorites';

const paris: import('../types').GeoLocation = { latitude: 48.85, longitude: 2.35, name: 'Paris' };

function makeFavorites(overrides: Partial<UseFavoritesResult> = {}): UseFavoritesResult {
  return {
    favorites: [],
    add: vi.fn(),
    remove: vi.fn(),
    isFavorite: vi.fn().mockReturnValue(false),
    canAdd: true,
    ...overrides,
  };
}

describe('FavoriteChips', () => {
  it('always renders the Belgrade (default) chip', () => {
    render(
      <FavoriteChips
        current={DEFAULT_LOCATION}
        onSelect={vi.fn()}
        favorites={makeFavorites()}
      />,
    );
    expect(screen.getByText(/Belgrade/)).toBeInTheDocument();
  });

  it('marks the default chip with a star', () => {
    render(
      <FavoriteChips
        current={DEFAULT_LOCATION}
        onSelect={vi.fn()}
        favorites={makeFavorites()}
      />,
    );
    expect(screen.getByText(/★/)).toBeInTheDocument();
  });

  it('renders saved favorite chips', () => {
    render(
      <FavoriteChips
        current={DEFAULT_LOCATION}
        onSelect={vi.fn()}
        favorites={makeFavorites({ favorites: [paris] })}
      />,
    );
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('calls onSelect when a chip is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <FavoriteChips
        current={DEFAULT_LOCATION}
        onSelect={onSelect}
        favorites={makeFavorites({ favorites: [paris] })}
      />,
    );
    await user.click(screen.getByText('Paris'));
    expect(onSelect).toHaveBeenCalledWith(paris);
  });

  it('shows "+" button to save a non-default unsaved location', () => {
    render(
      <FavoriteChips
        current={paris}
        onSelect={vi.fn()}
        favorites={makeFavorites()}
      />,
    );
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('calls add when "+" is clicked', async () => {
    const add = vi.fn();
    const user = userEvent.setup();
    render(
      <FavoriteChips
        current={paris}
        onSelect={vi.fn()}
        favorites={makeFavorites({ add })}
      />,
    );
    await user.click(screen.getByText('+'));
    expect(add).toHaveBeenCalledWith(paris);
  });

  it('shows "✕" button to remove a saved location', () => {
    render(
      <FavoriteChips
        current={paris}
        onSelect={vi.fn()}
        favorites={makeFavorites({ favorites: [paris] })}
      />,
    );
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('disables "+" when canAdd is false', () => {
    render(
      <FavoriteChips
        current={paris}
        onSelect={vi.fn()}
        favorites={makeFavorites({ canAdd: false })}
      />,
    );
    expect(screen.getByText('+')).toBeDisabled();
  });

  it('does not show add/remove button for the default location', () => {
    render(
      <FavoriteChips
        current={DEFAULT_LOCATION}
        onSelect={vi.fn()}
        favorites={makeFavorites()}
      />,
    );
    expect(screen.queryByText('+')).toBeNull();
    expect(screen.queryByText('✕')).toBeNull();
  });
});
