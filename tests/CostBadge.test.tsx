import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostBadge } from '../src/frontend/components/common/CostBadge';

/**
 * Unit tests for CostBadge component
 * Requirements: 3.7, 5.7, 5.8
 */

describe('CostBadge Component', () => {
  describe('Basic cost display', () => {
    it('should render base cost without modifier', () => {
      render(<CostBadge baseCost={5} />);

      expect(screen.getByText('5 pts')).toBeInTheDocument();
    });

    it('should render zero cost', () => {
      render(<CostBadge baseCost={0} />);

      expect(screen.getByText('0 pts')).toBeInTheDocument();
    });

    it('should render large cost values', () => {
      render(<CostBadge baseCost={100} />);

      expect(screen.getByText('100 pts')).toBeInTheDocument();
    });
  });

  describe('Modified cost display', () => {
    it('should show both base and modified cost when different', () => {
      render(<CostBadge baseCost={5} modifiedCost={3} />);

      expect(screen.getByText('5 pts')).toBeInTheDocument();
      expect(screen.getByText('3 pts')).toBeInTheDocument();
    });

    it('should show arrow between base and modified cost', () => {
      render(<CostBadge baseCost={5} modifiedCost={3} />);

      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('should apply modified class when costs differ', () => {
      const { container } = render(<CostBadge baseCost={5} modifiedCost={3} />);

      const badge = container.querySelector('.cost-badge');
      expect(badge).toHaveClass('modified');
    });

    it('should show strikethrough on original cost', () => {
      const { container } = render(<CostBadge baseCost={5} modifiedCost={3} />);

      const originalCost = container.querySelector('.cost-badge-original');
      expect(originalCost).toBeInTheDocument();
      expect(originalCost).toHaveTextContent('5 pts');
    });

    it('should highlight modified cost', () => {
      const { container } = render(<CostBadge baseCost={5} modifiedCost={3} />);

      const modifiedCost = container.querySelector('.cost-badge-current');
      expect(modifiedCost).toBeInTheDocument();
      expect(modifiedCost).toHaveTextContent('3 pts');
    });

    it('should handle cost reduction to zero', () => {
      render(<CostBadge baseCost={5} modifiedCost={0} />);

      expect(screen.getByText('5 pts')).toBeInTheDocument();
      expect(screen.getByText('0 pts')).toBeInTheDocument();
    });

    it('should handle cost increase', () => {
      render(<CostBadge baseCost={5} modifiedCost={8} />);

      expect(screen.getByText('5 pts')).toBeInTheDocument();
      expect(screen.getByText('8 pts')).toBeInTheDocument();
    });
  });

  describe('Same cost handling', () => {
    it('should not show modified display when costs are equal', () => {
      const { container } = render(<CostBadge baseCost={5} modifiedCost={5} />);

      expect(screen.getByText('5 pts')).toBeInTheDocument();
      expect(screen.queryByText('→')).not.toBeInTheDocument();
      
      const badge = container.querySelector('.cost-badge');
      expect(badge).not.toHaveClass('modified');
    });

    it('should not show modified display when modifiedCost is undefined', () => {
      const { container } = render(<CostBadge baseCost={5} />);

      expect(screen.getByText('5 pts')).toBeInTheDocument();
      expect(screen.queryByText('→')).not.toBeInTheDocument();
      
      const badge = container.querySelector('.cost-badge');
      expect(badge).not.toHaveClass('modified');
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<CostBadge baseCost={5} className="custom-badge" />);

      const badge = container.querySelector('.cost-badge');
      expect(badge).toHaveClass('custom-badge');
    });

    it('should maintain base classes with custom className', () => {
      const { container } = render(<CostBadge baseCost={5} className="custom-badge" />);

      const badge = container.querySelector('.cost-badge');
      expect(badge).toHaveClass('cost-badge');
      expect(badge).toHaveClass('custom-badge');
    });
  });

  describe('Edge cases', () => {
    it('should handle negative costs', () => {
      render(<CostBadge baseCost={-5} />);

      expect(screen.getByText('-5 pts')).toBeInTheDocument();
    });

    it('should handle very large cost differences', () => {
      render(<CostBadge baseCost={100} modifiedCost={1} />);

      expect(screen.getByText('100 pts')).toBeInTheDocument();
      expect(screen.getByText('1 pts')).toBeInTheDocument();
    });

    it('should handle decimal costs', () => {
      render(<CostBadge baseCost={5.5} />);

      expect(screen.getByText('5.5 pts')).toBeInTheDocument();
    });
  });
});
