/**
 * InvestmentEditor - UI component for managing character economic investments
 * Integrates with existing character editor and follows established patterns
 * Provides investment opportunity discovery, cost calculation, and portfolio management
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Target, 
  AlertCircle, 
  Plus, 
  Minus,
  Eye,
  Calculator,
  Calendar,
  BarChart3,
  Coins,
  Building,
  Tractor,
  Pickaxe,
  Store,
  Landmark,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb
} from 'lucide-react';
import CharacterEconomicService from '../../domain/services/CharacterEconomicService';
import { EconomicProfile } from '../../domain/value-objects/EconomicProfile';

const InvestmentEditor = ({ 
  character, 
  onChange,
  availableInteractions = [],
  worldState = null,
  currentNode = null 
}) => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedInvestmentType, setSelectedInvestmentType] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showOpportunityDetails, setShowOpportunityDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Initialize economic profile if not present
  const economicProfile = character?.economicProfile || EconomicProfile.createDefault();

  // Get available investment types
  const availableInvestments = useMemo(() => {
    if (!character?.economicProfile) {
      return { isValid: false, data: [] };
    }
    return CharacterEconomicService.getAvailableInvestments(character);
  }, [character]);

  // Calculate portfolio analysis
  const portfolioAnalysis = useMemo(() => {
    if (!character?.economicProfile) {
      return { isValid: false, data: null };
    }
    return CharacterEconomicService.analyzePortfolio(character);
  }, [character]);

  // Investment type icons
  const getInvestmentIcon = (investmentType) => {
    switch (investmentType.category) {
      case 'agriculture': return <Tractor className="w-5 h-5" />;
      case 'trade': return <Store className="w-5 h-5" />;
      case 'mining': return <Pickaxe className="w-5 h-5" />;
      case 'infrastructure': return <Building className="w-5 h-5" />;
      case 'financial': return <Landmark className="w-5 h-5" />;
      default: return <Coins className="w-5 h-5" />;
    }
  };

  // Risk level colors
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'very_high': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Handle investment creation
  const handleCreateInvestment = useCallback(async (investmentTypeId, amount) => {
    if (!character?.economicProfile) {
      setLastError('Character must have an economic profile');
      return;
    }

    setIsProcessing(true);
    setLastError(null);

    try {
      const result = CharacterEconomicService.createInvestment(
        character, 
        investmentTypeId, 
        parseFloat(amount)
      );

      if (result.isValid) {
        // Update character with new investment
        onChange(result.data.character);
        
        // Reset form
        setInvestmentAmount('');
        setSelectedInvestmentType(null);
        
        // Show success feedback
        console.log('Investment created successfully:', result.data.investment);
      } else {
        setLastError(result.errors.map(e => e.message).join(', '));
      }
    } catch (error) {
      setLastError(error.message || 'Failed to create investment');
    } finally {
      setIsProcessing(false);
    }
  }, [character, onChange]);

  // Handle investment liquidation
  const handleLiquidateInvestment = useCallback(async (investmentId, emergency = false) => {
    if (!character?.economicProfile) {
      setLastError('Character must have an economic profile');
      return;
    }

    setIsProcessing(true);
    setLastError(null);

    try {
      const result = CharacterEconomicService.liquidateInvestment(
        character, 
        investmentId, 
        emergency
      );

      if (result.isValid) {
        // Update character with liquidated investment
        onChange(result.data.character);
        
        console.log('Investment liquidated successfully:', result.data);
      } else {
        setLastError(result.errors.map(e => e.message).join(', '));
      }
    } catch (error) {
      setLastError(error.message || 'Failed to liquidate investment');
    } finally {
      setIsProcessing(false);
    }
  }, [character, onChange]);

  // Handle economic goal updates
  const handleUpdateEconomicGoals = useCallback((newGoals) => {
    if (!character?.economicProfile) {
      const newProfile = EconomicProfile.createDefault().withGoals(newGoals);
      onChange({
        ...character,
        economicProfile: newProfile
      });
    } else {
      const updatedProfile = character.economicProfile.withGoals(newGoals);
      onChange({
        ...character,
        economicProfile: updatedProfile
      });
    }
  }, [character, onChange]);

  // Calculate maximum affordable amount for selected investment type
  const maxAffordableAmount = useMemo(() => {
    if (!selectedInvestmentType || !character?.economicProfile) {
      return 0;
    }
    return CharacterEconomicService.calculateAffordableAmount(character, selectedInvestmentType);
  }, [selectedInvestmentType, character]);

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: <PieChart className="w-4 h-4" /> },
    { id: 'opportunities', label: 'Opportunities', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'income', label: 'Passive Income', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'goals', label: 'Economic Goals', icon: <Target className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Investment Management</h3>
            <p className="text-sm text-gray-400">
              Manage {character?.name || 'character'}'s economic investments and goals
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Wealth</div>
          <div className="text-lg font-bold text-green-400">
            {economicProfile.getTotalValue()?.toFixed(2) || '0.00'} coins
          </div>
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm">{lastError}</span>
          <button
            onClick={() => setLastError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Wealth Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Liquid Wealth</span>
          </div>
          <div className="text-xl font-bold text-white">
            {economicProfile.wealth?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Investments</span>
          </div>
          <div className="text-xl font-bold text-white">
            {economicProfile.getTotalInvestmentValue()?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Passive Income</span>
          </div>
          <div className="text-xl font-bold text-white">
            {economicProfile.passiveIncome?.toFixed(2) || '0.00'}/turn
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Investment Portfolio</h4>
              <span className="text-sm text-gray-400">
                {economicProfile.investments?.length || 0} investments
              </span>
            </div>

            {/* Portfolio Analysis */}
            {portfolioAnalysis.isValid && portfolioAnalysis.data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <h5 className="font-medium text-blue-300 mb-2">Diversification</h5>
                  <div className="text-2xl font-bold text-white mb-1">
                    {(portfolioAnalysis.data.diversification.diversificationScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-200">
                    {portfolioAnalysis.data.diversification.types.length} asset types
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <h5 className="font-medium text-purple-300 mb-2">Portfolio Risk</h5>
                  <div className="text-2xl font-bold text-white mb-1 capitalize">
                    {portfolioAnalysis.data.risk.averageRisk}
                  </div>
                  <div className="text-sm text-purple-200">
                    Risk Score: {portfolioAnalysis.data.risk.riskScore.toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {/* Current Investments */}
            <div className="space-y-3">
              {economicProfile.investments?.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">No investments yet</p>
                  <p className="text-sm text-gray-400">Use the Opportunities tab to start investing</p>
                </div>
              ) : (
                economicProfile.investments?.map(investment => (
                  <div
                    key={investment.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getInvestmentIcon(CharacterEconomicService.INVESTMENT_TYPES[investment.type] || {})}
                        <div>
                          <h5 className="font-medium text-white">{investment.name || investment.type}</h5>
                          <p className="text-sm text-gray-400 mb-2">
                            {investment.description || 'Custom investment'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Value: {investment.value.toFixed(2)} coins</span>
                            <span className={`px-2 py-1 rounded ${getRiskColor(investment.riskLevel)}`}>
                              {investment.riskLevel} risk
                            </span>
                            {investment.expectedReturn && (
                              <span>Expected: {(investment.expectedReturn * 100).toFixed(1)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowOpportunityDetails(investment)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleLiquidateInvestment(investment.id)}
                          disabled={isProcessing}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                          title="Liquidate investment"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Investment Opportunities</h4>
              <span className="text-sm text-gray-400">
                {availableInvestments.data?.length || 0} opportunities
              </span>
            </div>

            {/* Investment Calculator */}
            {selectedInvestmentType && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <h5 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Investment Calculator
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Investment Amount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={selectedInvestmentType.minInvestment}
                        max={Math.min(selectedInvestmentType.maxInvestment, maxAffordableAmount)}
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder={`Min: ${selectedInvestmentType.minInvestment}`}
                      />
                      <button
                        onClick={() => setInvestmentAmount(maxAffordableAmount.toString())}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Available: {maxAffordableAmount.toFixed(2)} coins
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expected Returns
                    </label>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-green-400 font-medium">
                        +{((parseFloat(investmentAmount) || 0) * (selectedInvestmentType.expectedReturn || 0)).toFixed(2)} coins/turn
                      </div>
                      <div className="text-xs text-gray-400">
                        {((selectedInvestmentType.expectedReturn || 0) * 100).toFixed(1)}% return rate
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleCreateInvestment(selectedInvestmentType.id, investmentAmount)}
                    disabled={!investmentAmount || parseFloat(investmentAmount) < selectedInvestmentType.minInvestment || parseFloat(investmentAmount) > maxAffordableAmount || isProcessing}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {isProcessing ? 'Creating...' : 'Create Investment'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedInvestmentType(null);
                      setInvestmentAmount('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Available Opportunities */}
            <div className="space-y-3">
              {!availableInvestments.isValid ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-300 mb-2">No economic profile available</p>
                  <p className="text-sm text-gray-400">
                    Character needs an economic profile to view investment opportunities
                  </p>
                </div>
              ) : availableInvestments.data.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">No investment opportunities available</p>
                  <p className="text-sm text-gray-400">
                    Increase wealth or skills to unlock more opportunities
                  </p>
                </div>
              ) : (
                availableInvestments.data.map(opportunity => {
                  const isSelected = selectedInvestmentType?.id === opportunity.id;
                  
                  return (
                    <div
                      key={opportunity.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-500/20 border-blue-500/50' 
                          : opportunity.available 
                            ? 'bg-white/5 border-white/10 hover:border-white/30' 
                            : 'bg-gray-500/10 border-gray-500/20 opacity-50'
                      }`}
                      onClick={() => opportunity.available && setSelectedInvestmentType(opportunity)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getInvestmentIcon(opportunity)}
                          <div>
                            <h5 className="font-medium text-white flex items-center gap-2">
                              {opportunity.name}
                              {!opportunity.available && (
                                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                                  Locked
                                </span>
                              )}
                            </h5>
                            <p className="text-sm text-gray-400 mb-2">
                              {opportunity.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Min: {opportunity.minInvestment} coins</span>
                              <span>Max: {opportunity.maxInvestment} coins</span>
                              <span className={`px-2 py-1 rounded ${getRiskColor(opportunity.riskLevel)}`}>
                                {opportunity.riskLevel} risk
                              </span>
                              <span>Return: {(opportunity.expectedReturn * 100).toFixed(1)}%</span>
                            </div>
                            
                            {/* Recommendation */}
                            {opportunity.available && opportunity.recommendation && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  opportunity.recommendation.recommendation === 'highly_recommended' ? 'bg-green-400' :
                                  opportunity.recommendation.recommendation === 'recommended' ? 'bg-blue-400' :
                                  opportunity.recommendation.recommendation === 'consider' ? 'bg-yellow-400' :
                                  'bg-red-400'
                                }`}></div>
                                <span className="text-xs text-gray-400">
                                  {opportunity.recommendation.reason}
                                </span>
                              </div>
                            )}

                            {/* Prerequisites for locked investments */}
                            {!opportunity.available && opportunity.reasons && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-400 mb-1">Requirements:</div>
                                <div className="space-y-1">
                                  {opportunity.reasons.slice(0, 3).map((reason, index) => (
                                    <div key={index} className="text-xs text-red-400 flex items-center gap-1">
                                      <XCircle className="w-3 h-3" />
                                      {reason.message}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {opportunity.available && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowOpportunityDetails(opportunity);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                title="View details"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                              {isSelected ? (
                                <CheckCircle className="w-5 h-5 text-blue-400" />
                              ) : (
                                <Plus className="w-5 h-5 text-green-400" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Passive Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Passive Income Management</h4>
              <div className="text-right">
                <div className="text-sm text-gray-400">Current Income</div>
                <div className="text-lg font-bold text-green-400">
                  {economicProfile.passiveIncome?.toFixed(2) || '0.00'} coins/turn
                </div>
              </div>
            </div>

            {/* Income Sources */}
            <div className="space-y-4">
              <h5 className="font-medium text-white">Income Sources</h5>
              
              {economicProfile.investments?.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">No passive income sources</p>
                  <p className="text-sm text-gray-400">
                    Create investments to generate passive income
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {economicProfile.investments?.map(investment => {
                    const investmentType = CharacterEconomicService.INVESTMENT_TYPES[investment.type];
                    const annualIncome = investment.value * (investment.expectedReturn || 0);
                    
                    return (
                      <div
                        key={investment.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getInvestmentIcon(investmentType || {})}
                            <div>
                              <h6 className="font-medium text-white">
                                {investment.name || investment.type}
                              </h6>
                              <div className="text-sm text-gray-400">
                                {investment.value.toFixed(2)} coins invested
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-medium">
                              +{annualIncome.toFixed(2)} coins/turn
                            </div>
                            <div className="text-xs text-gray-400">
                              {((investment.expectedReturn || 0) * 100).toFixed(1)}% return
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Income Projections */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <h5 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Income Projections
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Next Turn</div>
                  <div className="text-lg font-bold text-white">
                    +{economicProfile.passiveIncome?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">10 Turns</div>
                  <div className="text-lg font-bold text-white">
                    +{((economicProfile.passiveIncome || 0) * 10).toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">100 Turns</div>
                  <div className="text-lg font-bold text-white">
                    +{((economicProfile.passiveIncome || 0) * 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Economic Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Economic Goals</h4>
              <button
                onClick={() => {
                  // Add default goals if none exist
                  if (!economicProfile.goals || Object.keys(economicProfile.goals).length === 0) {
                    handleUpdateEconomicGoals({
                      wealth_target: {
                        target: (economicProfile.getTotalValue() || 0) * 2,
                        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        priority: 'medium'
                      }
                    });
                  }
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Set Goals
              </button>
            </div>

            {/* Current Goals */}
            <div className="space-y-4">
              {!economicProfile.goals || Object.keys(economicProfile.goals).length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">No economic goals set</p>
                  <p className="text-sm text-gray-400">
                    Set financial targets to guide investment decisions
                  </p>
                </div>
              ) : (
                Object.entries(economicProfile.goals).map(([goalType, goal]) => {
                  const currentValue = goalType === 'wealth_target' ? economicProfile.getTotalValue() :
                                    goalType === 'passive_income_target' ? economicProfile.passiveIncome :
                                    0;
                  const progress = Math.min(100, (currentValue / goal.target) * 100);
                  
                  return (
                    <div
                      key={goalType}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-white capitalize">
                            {goalType.replace('_', ' ')}
                          </h5>
                          <div className="text-sm text-gray-400">
                            Target: {goal.target.toFixed(2)} coins
                          </div>
                          {goal.deadline && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(goal.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {progress.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-400">
                            {currentValue.toFixed(2)} / {goal.target.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress >= 100 ? 'bg-green-500' :
                            progress >= 75 ? 'bg-blue-500' :
                            progress >= 50 ? 'bg-yellow-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      
                      {/* Goal Status */}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded ${
                          progress >= 100 ? 'bg-green-500/20 text-green-300' :
                          progress >= 50 ? 'bg-blue-500/20 text-blue-300' :
                          'bg-orange-500/20 text-orange-300'
                        }`}>
                          {progress >= 100 ? 'Completed' :
                           progress >= 50 ? 'On Track' :
                           'Needs Attention'}
                        </span>
                        {goal.deadline && (
                          <span className="text-gray-400">
                            {Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Goal Setting Form */}
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <h5 className="font-medium text-yellow-300 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Investment Recommendations
              </h5>
              
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded">
                  <div className="text-sm text-white font-medium mb-1">
                    Diversification Opportunity
                  </div>
                  <div className="text-xs text-gray-400">
                    Consider spreading investments across different categories to reduce risk
                  </div>
                </div>
                
                <div className="p-3 bg-white/5 rounded">
                  <div className="text-sm text-white font-medium mb-1">
                    Income Growth Strategy
                  </div>
                  <div className="text-xs text-gray-400">
                    Focus on investments with steady returns to build passive income
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Opportunity Details Modal */}
      {showOpportunityDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getInvestmentIcon(showOpportunityDetails)}
                  <h3 className="text-xl font-bold text-white">
                    {showOpportunityDetails.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowOpportunityDetails(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-gray-300">{showOpportunityDetails.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">Investment Range</h4>
                    <div className="text-gray-300">
                      {showOpportunityDetails.minInvestment} - {showOpportunityDetails.maxInvestment} coins
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Expected Return</h4>
                    <div className="text-green-400 font-medium">
                      {(showOpportunityDetails.expectedReturn * 100).toFixed(1)}% per turn
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Risk Assessment</h4>
                  <div className={`inline-block px-3 py-1 rounded ${getRiskColor(showOpportunityDetails.riskLevel)}`}>
                    {showOpportunityDetails.riskLevel} risk
                  </div>
                </div>

                {showOpportunityDetails.liquidityDays && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Liquidity</h4>
                    <div className="text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Can be liquidated after {showOpportunityDetails.liquidityDays} days
                    </div>
                  </div>
                )}

                {showOpportunityDetails.settlementEffects && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Settlement Effects</h4>
                    <div className="space-y-1">
                      {Object.entries(showOpportunityDetails.settlementEffects).map(([effect, data]) => (
                        <div key={effect} className="text-sm text-gray-300">
                          <span className="capitalize">{effect}:</span>{' '}
                          +{((data.multiplier - 1) * 100).toFixed(1)}% {data.type}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedInvestmentType(showOpportunityDetails);
                    setShowOpportunityDetails(null);
                    setActiveTab('opportunities');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Invest Now
                </button>
                <button
                  onClick={() => setShowOpportunityDetails(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentEditor;
