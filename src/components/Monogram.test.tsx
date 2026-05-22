import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Monogram from './Monogram';

describe('Monogram', () => {
  it('renders the mono text', () => {
    render(<Monogram mono="CC" hue={28} />);
    expect(screen.getByText('CC')).toBeInTheDocument();
  });

  it('applies hue as oklch background', () => {
    const { container } = render(<Monogram mono="CC" hue={28} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.background).toContain('28');
  });
});
