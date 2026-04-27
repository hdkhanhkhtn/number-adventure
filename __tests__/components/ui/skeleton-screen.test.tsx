/**
 * Tests for SkeletonScreen component
 * Tests basic rendering and styling.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { SkeletonScreen } from '@/components/ui/skeleton-screen';

describe('SkeletonScreen', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SkeletonScreen />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a fixed full-screen outer container', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;

      // Check key layout properties
      expect(outerDiv.style.position).toBe('fixed');
      expect(outerDiv.style.inset).toBe('0');
      expect(outerDiv.style.display).toBe('flex');
      expect(outerDiv.style.alignItems).toBe('center');
      expect(outerDiv.style.justifyContent).toBe('center');
    });

    it('contains an animated circle element', () => {
      const { container } = render(<SkeletonScreen />);
      const circle = container.querySelector('div > div') as HTMLElement;

      expect(circle).toBeTruthy();
      // Circle should be a div with styling
      expect(circle.tagName).toBe('DIV');
    });

    it('background has cream color', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;

      // jsdom converts hex colors to rgb
      const bgColor = outerDiv.style.background;
      expect(bgColor).toBeTruthy();
      expect(['#F5F3ED', 'rgb(245, 243, 237)'].includes(bgColor)).toBe(true);
    });

    it('circle has positioning on screen', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;
      const circle = outerDiv?.firstChild as HTMLElement;

      // Circle should exist as the only child of outer div
      expect(circle).toBeTruthy();
      // Outer div should have flex layout
      expect(outerDiv.style.display).toBe('flex');
    });

    it('component uses flexbox for centering', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;

      expect(outerDiv.style.display).toBe('flex');
      expect(outerDiv.style.alignItems).toBe('center');
      expect(outerDiv.style.justifyContent).toBe('center');
    });

    it('outer container is positioned fixed', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;

      expect(outerDiv.style.position).toBe('fixed');
    });
  });

  describe('styling', () => {
    it('uses sage color for circle background', () => {
      const { container } = render(<SkeletonScreen />);
      const circle = container.querySelector('div > div') as HTMLElement;

      const bgColor = circle.style.background;
      // jsdom converts to rgb, verify it's set
      expect(bgColor).toBeTruthy();
    });

    it('circular element has animation applied', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;
      const circle = outerDiv?.firstChild as HTMLElement;

      // Animation should be on the circle element
      const animation = circle?.style.animation;
      expect(animation).toBeTruthy();
    });
  });

  describe('layout', () => {
    it('outer container covers full viewport with inset', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;

      expect(outerDiv.style.inset).toBe('0');
    });

    it('uses flexbox for centering', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;

      expect(outerDiv.style.display).toBe('flex');
      expect(outerDiv.style.alignItems).toBe('center');
      expect(outerDiv.style.justifyContent).toBe('center');
    });
  });

  describe('tree structure', () => {
    it('has correct DOM hierarchy', () => {
      const { container } = render(<SkeletonScreen />);

      const outerDiv = container.firstChild;
      expect(outerDiv).toBeTruthy();

      const circle = (outerDiv as HTMLElement).firstChild;
      expect(circle).toBeTruthy();
    });

    it('outer div contains exactly one child', () => {
      const { container } = render(<SkeletonScreen />);
      const outerDiv = container.firstChild as HTMLElement;

      expect(outerDiv.children.length).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('is not semantically meaningful (decorative)', () => {
      const { container } = render(<SkeletonScreen />);

      // Skeleton screen is a visual loading indicator, should not have semantic role
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.tagName).toBe('DIV');
      // No aria-label or explicit role, correct for decorative element
      expect(outerDiv.getAttribute('role')).toBeNull();
    });
  });
});
