import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  const baseProps = {
    nowX: 50,
    nowY: 24,
    height: 48,
    id: 'test-spark',
  };

  it('renders the SVG with correct viewBox', () => {
    const { container } = render(<Sparkline {...baseProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 48');
  });

  it('renders past and future clipPath elements', () => {
    const { container } = render(<Sparkline {...baseProps} />);
    expect(container.querySelector('#test-spark-past')).toBeInTheDocument();
    expect(container.querySelector('#test-spark-future')).toBeInTheDocument();
  });

  it('renders the dashed now-line', () => {
    const { container } = render(<Sparkline {...baseProps} />);
    const line = container.querySelector('line');
    expect(line).toBeInTheDocument();
    expect(line?.getAttribute('stroke-dasharray')).toBe('2 3');
    expect(line?.getAttribute('x1')).toBe('50');
  });

  it('renders the now dot', () => {
    const { container } = render(<Sparkline {...baseProps} />);
    const dot = container.querySelector('span.rounded-full');
    expect(dot).toBeInTheDocument();
    expect((dot as HTMLElement).style.left).toBe('50%');
  });

  it('calls svgContent with pastClip and futureClip', () => {
    const captured = { pastClip: '', futureClip: '' };
    render(
      <Sparkline
        {...baseProps}
        svgContent={(ctx) => {
          captured.pastClip  = ctx.pastClip;
          captured.futureClip = ctx.futureClip;
          return null;
        }}
      />,
    );
    expect(captured.pastClip).toBe('url(#test-spark-past)');
    expect(captured.futureClip).toBe('url(#test-spark-future)');
  });

  it('renders HTML overlay children', () => {
    render(
      <Sparkline {...baseProps}>
        <span data-testid="overlay">label</span>
      </Sparkline>,
    );
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });

  it('accounts for extraBottom in wrapper height', () => {
    const { container } = render(<Sparkline {...baseProps} extraBottom={14} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe('62px');
  });
});
