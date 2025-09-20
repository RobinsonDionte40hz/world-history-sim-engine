/**
 * ConsciousnessMonitoringDashboard.test.js
 *
 * Tests for the Consciousness Monitoring Dashboard React component.
 * Tests rendering, user interactions, data display, and real-time updates.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsciousnessMonitoringDashboard from '../ConsciousnessMonitoringDashboard';

// Mock the monitoring service
const mockMonitoringService = {
    getMonitoringStatus: jest.fn(),
    acknowledgeAlert: jest.fn(),
    reset: jest.fn()
};

const mockMonitoringData = {
    isActive: true,
    metrics: {
        performance: {
            averageUpdateTime: 45.5,
            updateCount: 150,
            updateFrequency: 2.5,
            maxUpdateTime: 120,
            minUpdateTime: 15
        },
        behavioral: {
            behavioralConsistency: 0.85,
            stateChanges: 25,
            significantEvents: 8,
            decisionFactors: [
                { factor: 0.7, characterId: 'char1' },
                { factor: 0.8, characterId: 'char2' }
            ]
        },
        health: {
            systemStability: 0.92,
            errorCount: 3,
            warningCount: 5,
            criticalIssues: 1
        },
        analytics: {
            performanceTrends: [
                { timestamp: Date.now() - 60000, trend: 'stable' },
                { timestamp: Date.now() - 30000, trend: 'improving' }
            ],
            consciousnessEvolution: [
                { timestamp: Date.now(), trend: 0.1, volatility: 0.05, averageFactor: 0.75 }
            ],
            behavioralPatterns: {
                personality_shift: [
                    { characterId: 'char1', timestamp: Date.now(), data: { significance: 0.9 } }
                ]
            }
        }
    },
    alerts: [
        {
            id: 'alert1',
            timestamp: Date.now() - 300000,
            level: 'warning',
            type: 'SLOW_UPDATE',
            data: { duration: 150, threshold: 100 },
            acknowledged: false
        },
        {
            id: 'alert2',
            timestamp: Date.now() - 600000,
            level: 'critical',
            type: 'CONSCIOUSNESS_ERROR',
            data: { error: 'Test error' },
            acknowledged: true
        }
    ]
};

describe('ConsciousnessMonitoringDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMonitoringService.getMonitoringStatus.mockReturnValue(mockMonitoringData);
        mockMonitoringService.acknowledgeAlert.mockReturnValue(true);
        mockMonitoringService.reset.mockReturnValue(undefined);

        // Mock setInterval and clearInterval
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('Rendering', () => {
        test('should render dashboard with loading state initially', () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={null} />);

            expect(screen.getByText('Consciousness System Monitor')).toBeInTheDocument();
            expect(screen.getByText('Monitoring service not available')).toBeInTheDocument();
        });

        test('should render dashboard with error state when service unavailable', async () => {
            mockMonitoringService.getMonitoringStatus.mockImplementation(() => {
                throw new Error('Service unavailable');
            });

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Failed to load monitoring data: Service unavailable')).toBeInTheDocument();
            });

            expect(screen.getByText('Retry')).toBeInTheDocument();
        });

        test('should render dashboard with monitoring data', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Consciousness System Monitor')).toBeInTheDocument();
            });

            expect(screen.getByText('🟢 Active')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Performance' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Behavioral' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Alerts \(\d+\)/ })).toBeInTheDocument();
        });

        test('should render inactive status when monitoring is stopped', async () => {
            const inactiveData = { ...mockMonitoringData, isActive: false };
            mockMonitoringService.getMonitoringStatus.mockReturnValue(inactiveData);

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('🔴 Inactive')).toBeInTheDocument();
            });
        });
    });

    describe('Tab Navigation', () => {
        test('should switch between tabs', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            });

            // Click Performance tab (get by role button)
            fireEvent.click(screen.getByRole('button', { name: 'Performance' }));
            expect(screen.getByText('Update Performance')).toBeInTheDocument();

            // Click Behavioral tab
            fireEvent.click(screen.getByRole('button', { name: 'Behavioral' }));
            expect(screen.getByText('Behavioral Metrics')).toBeInTheDocument();

            // Click Alerts tab
            fireEvent.click(screen.getByRole('button', { name: /Alerts \(\d+\)/ }));
            expect(screen.getByText('Active Alerts (1)')).toBeInTheDocument();

            // Click Analytics tab
            fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));
            expect(screen.getByText('Performance Trends')).toBeInTheDocument();
        });

        test('should highlight active tab', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                const overviewTab = screen.getByRole('button', { name: 'Overview' });
                expect(overviewTab).toHaveClass('active');
            });

            fireEvent.click(screen.getByRole('button', { name: 'Performance' }));
            const performanceTab = screen.getByRole('button', { name: 'Performance' });
            expect(performanceTab).toHaveClass('active');
        });
    });

    describe('Overview Tab', () => {
        test('should display system health metrics', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('System Health')).toBeInTheDocument();
            });

            expect(screen.getByText('92.0% Stable')).toBeInTheDocument();
            expect(screen.getByText('Avg Update: 45.5ms')).toBeInTheDocument();
            expect(screen.getByText('Updates: 150')).toBeInTheDocument();
            expect(screen.getByText('Consistency: 85.0%')).toBeInTheDocument();
            expect(screen.getByText('0 Critical')).toBeInTheDocument();
        });

        test('should display recent alerts', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
            });

            expect(screen.getByText('WARNING')).toBeInTheDocument();
            expect(screen.getByText('SLOW_UPDATE')).toBeInTheDocument();
        });

        test('should show no alerts message when no active alerts', async () => {
            const noAlertsData = { ...mockMonitoringData, alerts: [] };
            mockMonitoringService.getMonitoringStatus.mockReturnValue(noAlertsData);

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('No active alerts')).toBeInTheDocument();
            });
        });
    });

    describe('Performance Tab', () => {
        test('should display performance metrics', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByRole('button', { name: 'Performance' }));

            await waitFor(() => {
                expect(screen.getByText('Update Performance')).toBeInTheDocument();
            });

            expect(screen.getByText('Average Update Time:')).toBeInTheDocument();
            expect(screen.getByText('45.50ms')).toBeInTheDocument();
            expect(screen.getByText('Max Update Time:')).toBeInTheDocument();
            expect(screen.getByText('120.00ms')).toBeInTheDocument();
            expect(screen.getByText('System Stability:')).toBeInTheDocument();
            expect(screen.getByText('92.0%')).toBeInTheDocument();
        });

        test('should highlight error values', async () => {
            const errorData = {
                ...mockMonitoringData,
                metrics: {
                    ...mockMonitoringData.metrics,
                    health: {
                        ...mockMonitoringData.metrics.health,
                        errorCount: 10
                    }
                }
            };
            mockMonitoringService.getMonitoringStatus.mockReturnValue(errorData);

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByRole('button', { name: 'Performance' }));

            await waitFor(() => {
                const errorCount = screen.getByText('10');
                expect(errorCount).toHaveClass('error');
            });
        });
    });

    describe('Behavioral Tab', () => {
        test('should display behavioral metrics', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByRole('button', { name: 'Behavioral' }));

            await waitFor(() => {
                expect(screen.getByText('Behavioral Metrics')).toBeInTheDocument();
            });

            expect(screen.getByText('Behavioral Consistency:')).toBeInTheDocument();
            expect(screen.getByText('85.0%')).toBeInTheDocument();
            expect(screen.getByText('State Changes:')).toBeInTheDocument();
            expect(screen.getByText('25')).toBeInTheDocument();
        });

        test('should display decision factors', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByRole('button', { name: 'Behavioral' }));

            await waitFor(() => {
                expect(screen.getByText('Decision Factors')).toBeInTheDocument();
            });

            expect(screen.getByText('Factor: 0.700')).toBeInTheDocument();
            expect(screen.getByText('Character: char1')).toBeInTheDocument();
        });

        test('should show no decision data message', async () => {
            const noDecisionData = {
                ...mockMonitoringData,
                metrics: {
                    ...mockMonitoringData.metrics,
                    behavioral: {
                        ...mockMonitoringData.metrics.behavioral,
                        decisionFactors: []
                    }
                }
            };
            mockMonitoringService.getMonitoringStatus.mockReturnValue(noDecisionData);

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByRole('button', { name: 'Behavioral' }));

            await waitFor(() => {
                expect(screen.getByText('No recent decision data')).toBeInTheDocument();
            });
        });
    });

    describe('Alerts Tab', () => {
        test('should display active alerts', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Alerts (1)'));

            await waitFor(() => {
                expect(screen.getByText('Active Alerts (1)')).toBeInTheDocument();
            });

            expect(screen.getByText('WARNING')).toBeInTheDocument();
            expect(screen.getByText('SLOW_UPDATE')).toBeInTheDocument();
            expect(screen.getByText('Acknowledge')).toBeInTheDocument();
        });

        test('should display acknowledged alerts', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Alerts (1)'));

            await waitFor(() => {
                expect(screen.getByText('Acknowledged Alerts (1)')).toBeInTheDocument();
            });

            expect(screen.getByText('CRITICAL')).toBeInTheDocument();
            expect(screen.getByText('CONSCIOUSNESS_ERROR')).toBeInTheDocument();
        });

        test('should acknowledge alerts when button clicked', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Alerts (1)'));

            await waitFor(() => {
                expect(screen.getByText('Acknowledge')).toBeInTheDocument();
            });

            const acknowledgeButton = screen.getByText('Acknowledge');
            fireEvent.click(acknowledgeButton);

            expect(mockMonitoringService.acknowledgeAlert).toHaveBeenCalledWith('alert1');
        });

        test('should show no active alerts message', async () => {
            const noActiveAlerts = {
                ...mockMonitoringData,
                alerts: mockMonitoringData.alerts.map(a => ({ ...a, acknowledged: true }))
            };
            mockMonitoringService.getMonitoringStatus.mockReturnValue(noActiveAlerts);

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Alerts (0)'));

            await waitFor(() => {
                expect(screen.getByText('No active alerts')).toBeInTheDocument();
            });
        });
    });

    describe('Analytics Tab', () => {
        test('should display performance trends', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Analytics'));

            await waitFor(() => {
                expect(screen.getByText('Performance Trends')).toBeInTheDocument();
            });

            expect(screen.getByText('stable')).toBeInTheDocument();
            expect(screen.getByText('improving')).toBeInTheDocument();
        });

        test('should display consciousness evolution', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Analytics'));

            await waitFor(() => {
                expect(screen.getByText('Consciousness Evolution')).toBeInTheDocument();
            });

            expect(screen.getByText('Trend: 0.100')).toBeInTheDocument();
            expect(screen.getByText('Volatility: 0.050')).toBeInTheDocument();
            expect(screen.getByText('Avg Factor: 0.750')).toBeInTheDocument();
        });

        test('should display behavioral patterns', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Analytics'));

            await waitFor(() => {
                expect(screen.getByText('Behavioral Patterns')).toBeInTheDocument();
            });

            expect(screen.getByText('personality_shift (1)')).toBeInTheDocument();
            expect(screen.getByText('char1')).toBeInTheDocument();
        });

        test('should show no data messages', async () => {
            const noAnalyticsData = {
                ...mockMonitoringData,
                metrics: {
                    ...mockMonitoringData.metrics,
                    analytics: {
                        performanceTrends: [],
                        consciousnessEvolution: [],
                        behavioralPatterns: {}
                    }
                }
            };
            mockMonitoringService.getMonitoringStatus.mockReturnValue(noAnalyticsData);

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByText('Analytics'));

            await waitFor(() => {
                expect(screen.getByText('No trend data available')).toBeInTheDocument();
            });
            expect(screen.getByText('No evolution data available')).toBeInTheDocument();
            expect(screen.getByText('No pattern data available')).toBeInTheDocument();
        });
    });

    describe('Controls', () => {
        test('should call reset when reset button clicked', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Reset')).toBeInTheDocument();
            });

            const resetButton = screen.getByText('Reset');
            fireEvent.click(resetButton);

            expect(mockMonitoringService.reset).toHaveBeenCalled();
        });

        test('should refresh data when refresh button clicked', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Refresh')).toBeInTheDocument();
            });

            const refreshButton = screen.getByText('Refresh');
            fireEvent.click(refreshButton);

            expect(mockMonitoringService.getMonitoringStatus).toHaveBeenCalledTimes(2); // Initial + refresh
        });

        test('should call onClose when close button clicked', async () => {
            const mockOnClose = jest.fn();
            render(<ConsciousnessMonitoringDashboard
                monitoringService={mockMonitoringService}
                onClose={mockOnClose}
            />);

            await waitFor(() => {
                expect(screen.getByText('×')).toBeInTheDocument();
            });

            const closeButton = screen.getByText('×');
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalled();
        });

        test('should retry loading data when retry button clicked in error state', async () => {
            mockMonitoringService.getMonitoringStatus.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Retry')).toBeInTheDocument();
            });

            const retryButton = screen.getByText('Retry');
            fireEvent.click(retryButton);

            expect(mockMonitoringService.getMonitoringStatus).toHaveBeenCalledTimes(2);
        });
    });

    describe('Real-time Updates', () => {
        test('should update data at specified refresh interval', async () => {
            render(<ConsciousnessMonitoringDashboard
                monitoringService={mockMonitoringService}
                refreshInterval={1000}
            />);

            await waitFor(() => {
                expect(mockMonitoringService.getMonitoringStatus).toHaveBeenCalledTimes(1);
            });

            // Fast-forward time
            jest.advanceTimersByTime(1000);

            await waitFor(() => {
                expect(mockMonitoringService.getMonitoringStatus).toHaveBeenCalledTimes(2);
            });
        });

        test('should use default refresh interval of 5 seconds', async () => {
            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(mockMonitoringService.getMonitoringStatus).toHaveBeenCalledTimes(1);
            });

            // Fast-forward 5 seconds
            jest.advanceTimersByTime(5000);

            await waitFor(() => {
                expect(mockMonitoringService.getMonitoringStatus).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Responsive Design', () => {
        test('should render compact layout on small screens', async () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 600
            });

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                // Should still render but with responsive classes
                expect(screen.getByText('Consciousness System Monitor')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle acknowledge alert errors gracefully', async () => {
            mockMonitoringService.acknowledgeAlert.mockImplementation(() => {
                throw new Error('Acknowledge failed');
            });

            // Mock console.error to avoid test output pollution
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            fireEvent.click(screen.getByRole('button', { name: /Alerts \(\d+\)/ }));

            await waitFor(() => {
                expect(screen.getByText('Acknowledge')).toBeInTheDocument();
            });

            const acknowledgeButton = screen.getByText('Acknowledge');
            fireEvent.click(acknowledgeButton);

            // Should show error state, not crash
            await waitFor(() => {
                expect(screen.getByText('Failed to acknowledge alert: Acknowledge failed')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });

        test('should handle reset errors gracefully', async () => {
            mockMonitoringService.reset.mockImplementation(() => {
                throw new Error('Reset failed');
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            render(<ConsciousnessMonitoringDashboard monitoringService={mockMonitoringService} />);

            await waitFor(() => {
                expect(screen.getByText('Reset')).toBeInTheDocument();
            });

            const resetButton = screen.getByText('Reset');
            fireEvent.click(resetButton);

            // Should show error state, not crash
            await waitFor(() => {
                expect(screen.getByText('Failed to reset monitoring: Reset failed')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });
    });
});