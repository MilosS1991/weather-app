import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertToggle } from './AlertToggle';

const noop = () => Promise.resolve();

describe('AlertToggle', () => {
  it('renders nothing when not supported', () => {
    const { container } = render(
      <AlertToggle supported={false} permission="default" requestPermission={noop} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders button when supported', () => {
    render(<AlertToggle supported={true} permission="default" requestPermission={noop} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('button is enabled in default state', () => {
    render(<AlertToggle supported={true} permission="default" requestPermission={noop} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('button is disabled when permission granted', () => {
    render(<AlertToggle supported={true} permission="granted" requestPermission={noop} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('button is disabled when permission denied', () => {
    render(<AlertToggle supported={true} permission="denied" requestPermission={noop} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls requestPermission on click when default', async () => {
    const requestPermission = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AlertToggle supported={true} permission="default" requestPermission={requestPermission} />);
    await user.click(screen.getByRole('button'));
    expect(requestPermission).toHaveBeenCalledOnce();
  });
});
