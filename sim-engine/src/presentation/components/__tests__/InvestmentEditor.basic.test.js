/**
 * Basic InvestmentEditor Tests
 * Simplified tests to validate core functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentEditor from '../InvestmentEditor';
import CharacterEconomicService from '../../../domain/services/CharacterEconomicService';
import EconomicProfile from '../../../domain/value-objects/EconomicProfile';
import Character from '../../../domain/entities/Character';

// Mock the CharacterEconomicService
jest.mock('../../../domain/services/CharacterEconomicService');

describe('InvestmentEditor Basic Tests', () => {
  let mockCharacter;
  let mockOnChange;
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();

    // Create a mock character with economic profile
    const economicProfile = EconomicProfile.createStarter(1000);
    mockCharacter = new Character({
      id: 'test-character',
      name: 'Test Character',
      description: 'A test character for investment testing',
      economicProfile: economicProfile
    });

    mockOnChange = jest.fn();

    // Mock service responses
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
          riskScore: 0
        },
        expectedReturn: 0,
        investmentCount: 0
      }
    });
  });

  test('renders investment editor successfully', () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Investment Management')).toBeInTheDocument();
    expect(screen.getByText('Total Wealth')).toBeInTheDocument();
    expect(screen.getByText('1000.00 coins')).toBeInTheDocument();
  });

  test('displays all four main tabs', () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    // Check that all tab buttons are present
    expect(screen.getByRole('button', { name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Opportunities' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Passive Income' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Economic Goals' })).toBeInTheDocument();
  });

  test('shows portfolio information by default', () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
    expect(screen.getByText('0 investments')).toBeInTheDocument();
    expect(screen.getByText('No investments yet')).toBeInTheDocument();
  });

  test('can switch to opportunities tab', async () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Opportunities' }));
    
    expect(screen.getByText('Investment Opportunities')).toBeInTheDocument();
  });

  test('can switch to passive income tab', async () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Passive Income' }));
    
    expect(screen.getByText('Passive Income Management')).toBeInTheDocument();
  });

  test('can switch to economic goals tab', async () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Economic Goals' }));
    
    // Check for the heading within the tab content (should be the second occurrence)
    expect(screen.getAllByText('Economic Goals')).toHaveLength(2); // Tab button + content header
    expect(screen.getByText('Set Goals')).toBeInTheDocument();
  });

  test('displays wealth information correctly', () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    // Check wealth cards
    expect(screen.getByText('Liquid Wealth')).toBeInTheDocument();
    expect(screen.getByText('Investments')).toBeInTheDocument();
    expect(screen.getAllByText('Passive Income')[0]).toBeInTheDocument(); // First occurrence (wealth card)
    expect(screen.getByText('1000.00')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  test('handles character without economic profile gracefully', () => {
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

  test('calls CharacterEconomicService methods on render', () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    expect(CharacterEconomicService.analyzePortfolio).toHaveBeenCalledWith(mockCharacter);
  });

  test('displays investment opportunities when available', async () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Opportunities' }));

    expect(CharacterEconomicService.getAvailableInvestments).toHaveBeenCalledWith(mockCharacter);
  });

  test('shows diversification and risk information', () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Diversification')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Risk')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0 asset types')).toBeInTheDocument();
  });

  test('maintains component state when switching tabs', async () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    // Switch to opportunities and back to portfolio
    await user.click(screen.getByRole('button', { name: 'Opportunities' }));
    await user.click(screen.getByRole('button', { name: 'Portfolio' }));

    // Should still show portfolio content
    expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
  });

  test('validates props correctly', () => {
    // Test with minimal props
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Investment Management')).toBeInTheDocument();
  });

  test('follows existing UI patterns', () => {
    render(
      <InvestmentEditor
        character={mockCharacter}
        onChange={mockOnChange}
      />
    );

    // Check that tab buttons are properly rendered with correct roles
    const portfolioTab = screen.getByRole('button', { name: 'Portfolio' });
    expect(portfolioTab).toBeInTheDocument();
    expect(portfolioTab).toHaveClass('flex', 'items-center');
  });
});
