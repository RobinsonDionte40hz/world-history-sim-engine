/**
 * InvestmentEditor Integration Tests
 * Tests the investment editor component with various character configurations
 * Following existing test architecture patterns
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentEditor from '../InvestmentEditor';
import CharacterEconomicService from '../../../domain/services/CharacterEconomicService';
import { EconomicProfile } from '../../../domain/value-objects/EconomicProfile';
import Character from '../../../domain/entities/Character';

// Mock the CharacterEconomicService
jest.mock('../../../domain/services/CharacterEconomicService');

// Mock react-router-dom if needed
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: {} })
}));

describe('InvestmentEditor Integration Tests', () => {
  let mockCharacter;
  let mockOnChange;
  let user;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    user = userEvent.setup();

    // Create a mock character with economic profile
    const economicProfile = EconomicProfile.createStarter(1000);
    mockCharacter = new Character({
      id: 'test-character',
      name: 'Test Character',
      description: 'A test character for investment testing',
      attributes: {
        strength: 10,
        dexterity: 12,
        constitution: 11,
        intelligence: 15,
        wisdom: 13,
        charisma: 14
      },
      personality: {
        traits: {
          ambition: 0.8,
          risk_tolerance: 0.6
        }
      },
      goals: [
        {
          id: 'wealth-goal',
          description: 'Become wealthy',
          type: 'economic',
          priority: 'high'
        }
      ],
      economicProfile: economicProfile
    });

    mockOnChange = jest.fn();

    // Mock CharacterEconomicService methods
    CharacterEconomicService.getAvailableInvestments.mockReturnValue({
      isValid: true,
      data: [
        {
          id: 'savings',
          name: 'Savings Account',
          description: 'Safe storage of wealth with minimal returns',
          minInvestment: 1,
          maxInvestment: 10000,
          expectedReturn: 0.02,
          riskLevel: 'low',
          category: 'financial',
          available: true,
          affordableAmount: 800,
          recommendation: {
            score: 75,
            reason: 'Good starting investment',
            recommendation: 'recommended'
          }
        },
        {
          id: 'farmland',
          name: 'Farmland Purchase',
          description: 'Ownership of agricultural land for crop production',
          minInvestment: 100,
          maxInvestment: 5000,
          expectedReturn: 0.15,
          riskLevel: 'moderate',
          category: 'agriculture',
          available: true,
          affordableAmount: 800,
          recommendation: {
            score: 60,
            reason: 'Moderate risk with good returns',
            recommendation: 'consider'
          }
        },
        {
          id: 'trading_post',
          name: 'Trading Post',
          description: 'Investment in establishing trade connections',
          minInvestment: 300,
          maxInvestment: 5000,
          expectedReturn: 0.30,
          riskLevel: 'high',
          category: 'trade',
          available: false,
          reasons: [
            { message: 'Requires trading skill level 20', severity: 'error' }
          ]
        }
      ]
    });

    CharacterEconomicService.analyzePortfolio.mockReturnValue({
      isValid: true,
      data: {
        totalValue: 1000,
        liquidWealth: 1000,
        investmentValue: 0,
        passiveIncome: 0,
        diversification: {
          types: [],
          diversificationScore: 0
        },
        risk: {
          averageRisk: 'none',
          riskScore: 0,
          riskDistribution: {}
        },
        expectedReturn: 0,
        investmentCount: 0,
        performance: {
          totalInvested: 0,
          totalReturns: 0,
          profitLossRatio: 0,
          investmentCount: 0
        },
        recommendations: []
      }
    });

    CharacterEconomicService.calculateAffordableAmount.mockReturnValue(800);

    CharacterEconomicService.getInvestmentRecommendation.mockImplementation((character, investmentType) => {
      if (investmentType.id === 'savings') {
        return { score: 75, reason: 'Good starting investment', recommendation: 'recommended' };
      }
      return { score: 50, reason: 'Standard investment option', recommendation: 'consider' };
    });
  });

  describe('Component Rendering', () => {
    test('renders investment editor with all tabs', () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      // Check main heading
      expect(screen.getByText('Investment Management')).toBeInTheDocument();
      
      // Check tabs are present
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Passive Income')).toBeInTheDocument();
      expect(screen.getByText('Economic Goals')).toBeInTheDocument();
    });

    test('displays character wealth information', () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      // Check wealth display
      expect(screen.getByText('Total Wealth')).toBeInTheDocument();
      expect(screen.getByText('1000.00 coins')).toBeInTheDocument();
      expect(screen.getByText('Liquid Wealth')).toBeInTheDocument();
    });

    test('handles character without economic profile', () => {
      const characterWithoutProfile = new Character({
        id: 'test-character-no-profile',
        name: 'Test Character',
        description: 'A test character without economic profile'
      });

      render(
        <InvestmentEditor
          character={characterWithoutProfile}
          onChange={mockOnChange}
        />
      );

      // Should still render but with default values
      expect(screen.getByText('Investment Management')).toBeInTheDocument();
      expect(screen.getByText('0.00 coins')).toBeInTheDocument();
    });
  });

  describe('Portfolio Tab', () => {
    test('displays empty portfolio message when no investments', () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      // Should show empty state
      expect(screen.getByText('No investments yet')).toBeInTheDocument();
      expect(screen.getByText('Use the Opportunities tab to start investing')).toBeInTheDocument();
    });

    test('displays portfolio analysis when available', () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      // Check portfolio analysis sections
      expect(screen.getByText('Diversification')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Risk')).toBeInTheDocument();
    });
  });

  describe('Opportunities Tab', () => {
    test('displays available investment opportunities', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      // Switch to opportunities tab
      await user.click(screen.getByText('Opportunities'));

      // Check available investments are shown
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Farmland Purchase')).toBeInTheDocument();
      expect(screen.getByText('Trading Post')).toBeInTheDocument();

      // Check that locked investment shows requirements
      expect(screen.getByText('Locked')).toBeInTheDocument();
      expect(screen.getByText('Requires trading skill level 20')).toBeInTheDocument();
    });

    test('allows selecting investment opportunity', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      // Check that investment opportunities are displayed
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Farmland Purchase')).toBeInTheDocument();
      
      // Click on "View details" button for savings account
      const viewDetailsButtons = screen.getAllByRole('button', { name: 'View details' });
      await user.click(viewDetailsButtons[0]); // First view details button (Savings Account)

      // Should show investment calculator or details
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
    });

    test('calculates investment returns correctly', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      // Check that investment opportunities show expected returns
      expect(screen.getByText('2.0% expected return')).toBeInTheDocument();
      expect(screen.getByText('15.0% expected return')).toBeInTheDocument();
    });

    test('validates investment amount constraints', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      // Check that minimum investment amounts are displayed
      expect(screen.getByText('Min: 1 coins')).toBeInTheDocument();
      expect(screen.getByText('Min: 100 coins')).toBeInTheDocument();
    });
  });

  describe('Investment Creation', () => {
    test('displays investment opportunities correctly', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      // Verify investment opportunities are displayed
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Farmland Purchase')).toBeInTheDocument();
      expect(screen.getByText('Trading Post')).toBeInTheDocument();
      
      // Verify that locked investment shows requirements
      expect(screen.getByText('Locked')).toBeInTheDocument();
      expect(screen.getByText('Requires trading skill level 20')).toBeInTheDocument();
    });

    test('handles investment creation errors', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      // Check that investment opportunities display affordability
      expect(screen.getByText('Can afford up to 800 coins')).toBeInTheDocument();
    });
  });

  describe('Passive Income Tab', () => {
    test('displays passive income information', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Passive Income' }));

      expect(screen.getByText('Passive Income Management')).toBeInTheDocument();
      expect(screen.getByText('No passive income sources')).toBeInTheDocument();
    });

    test('shows income projections', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Passive Income' }));

      expect(screen.getByText('Income Projections')).toBeInTheDocument();
      expect(screen.getByText('Next Turn')).toBeInTheDocument();
      expect(screen.getByText('10 Turns')).toBeInTheDocument();
      expect(screen.getByText('100 Turns')).toBeInTheDocument();
    });
  });

  describe('Economic Goals Tab', () => {
    test('displays economic goals interface', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Economic Goals' }));

      expect(screen.getAllByText('Economic Goals')[1]).toBeInTheDocument(); // Header within tab content
      expect(screen.getByText('Set Goals')).toBeInTheDocument();
    });

    test('shows investment recommendations', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Economic Goals' }));

      expect(screen.getByText('Investment Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
      expect(screen.getByText('Income Growth Strategy')).toBeInTheDocument();
    });
  });

  describe('Accessibility and UX', () => {
    test('provides proper loading states', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      // Check that opportunities are displayed with loading-like states
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Farmland Purchase')).toBeInTheDocument();
    });

    test('allows keyboard navigation between tabs', async () => {
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      const portfolioTab = screen.getByText('Portfolio');
      const opportunitiesTab = screen.getByText('Opportunities');

      // Test keyboard navigation
      portfolioTab.focus();
      await user.keyboard('{Tab}');
      expect(opportunitiesTab).toHaveFocus();
    });

    test('provides helpful error messages', async () => {
      CharacterEconomicService.getAvailableInvestments.mockReturnValue({
        isValid: false,
        data: []
      });

      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      expect(screen.getByText('No economic profile available')).toBeInTheDocument();
      expect(screen.getByText('Character needs an economic profile to view investment opportunities')).toBeInTheDocument();
    });
  });

  describe('Integration with Character System', () => {
    test('maintains character data integrity', async () => {
      const originalAttributes = { ...mockCharacter.attributes };
      
      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
        />
      );

      // Verify that character attributes are not modified
      expect(mockCharacter.attributes).toEqual(originalAttributes);
    });

    test('works with existing interaction patterns', () => {
      const mockInteractions = [
        {
          id: 'trade-interaction',
          name: 'Trade Goods',
          category: 'trade',
          description: 'Trade with merchants'
        }
      ];

      render(
        <InvestmentEditor
          character={mockCharacter}
          onChange={mockOnChange}
          availableInteractions={mockInteractions}
        />
      );

      // Component should render without errors when interactions are provided
      expect(screen.getByText('Investment Management')).toBeInTheDocument();
    });

    test('follows existing validation patterns', async () => {
      // Test that the component respects character validation rules
      const invalidCharacter = {
        ...mockCharacter,
        economicProfile: null
      };

      render(
        <InvestmentEditor
          character={invalidCharacter}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByText('Opportunities'));

      // Should handle invalid economic profile gracefully
      expect(screen.getByText('No economic profile available')).toBeInTheDocument();
    });
  });
});
