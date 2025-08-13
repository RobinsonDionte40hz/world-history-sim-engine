/**
 * useAutoSave Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import useAutoSave from '../presentation/hooks/useAutoSave';

// Mock timers
jest.useFakeTimers();

describe('useAutoSave', () => {
  let mockSaveFunction;

  beforeEach(() => {
    mockSaveFunction = jest.fn().mockResolvedValue(true);
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should initialize with correct default state', () => {
    const { result } = renderHook(() => 
      useAutoSave(null, mockSaveFunction)
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBe(null);
    expect(result.current.saveError).toBe(null);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.isEnabled).toBe(true);
  });

  test('should detect unsaved changes when data changes', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useAutoSave(data, mockSaveFunction),
      { initialProps: { data: null } }
    );

    expect(result.current.hasUnsavedChanges).toBe(false);

    // Change data
    rerender({ data: { name: 'Test Node' } });

    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  test('should auto-save after delay', async () => {
    const testData = { name: 'Test Node', type: 'settlement' };
    
    const { result } = renderHook(() => 
      useAutoSave(testData, mockSaveFunction, 1000) // 1 second delay
    );

    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(mockSaveFunction).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for async save to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSaveFunction).toHaveBeenCalledWith(testData);
    expect(result.current.lastSaved).toBeInstanceOf(Date);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test('should debounce multiple data changes', async () => {
    const { rerender } = renderHook(
      ({ data }) => useAutoSave(data, mockSaveFunction, 1000),
      { initialProps: { data: { name: 'Test 1' } } }
    );

    // Change data multiple times quickly
    rerender({ data: { name: 'Test 2' } });
    rerender({ data: { name: 'Test 3' } });
    rerender({ data: { name: 'Test 4' } });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Should only save once with the latest data
    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(mockSaveFunction).toHaveBeenCalledWith({ name: 'Test 4' });
  });

  test('should handle save errors gracefully', async () => {
    const saveError = new Error('Save failed');
    mockSaveFunction.mockRejectedValue(saveError);

    const testData = { name: 'Test Node' };
    const { result } = renderHook(() => 
      useAutoSave(testData, mockSaveFunction, 1000)
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.saveError).toBe('Save failed');
    expect(result.current.isSaving).toBe(false);
  });

  test('should allow manual save', async () => {
    const testData = { name: 'Test Node' };
    const { result } = renderHook(() => 
      useAutoSave(testData, mockSaveFunction, 30000) // Long delay
    );

    expect(result.current.hasUnsavedChanges).toBe(true);

    // Manual save
    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockSaveFunction).toHaveBeenCalledWith(testData);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  test('should not save when disabled', () => {
    const testData = { name: 'Test Node' };
    const { result } = renderHook(() => 
      useAutoSave(testData, mockSaveFunction, 1000, false) // Disabled
    );

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSaveFunction).not.toHaveBeenCalled();
  });

  test('should not save when data is null or undefined', () => {
    renderHook(() => 
      useAutoSave(null, mockSaveFunction, 1000)
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSaveFunction).not.toHaveBeenCalled();
  });

  test('should not save when save function is not provided', () => {
    const testData = { name: 'Test Node' };
    const { result } = renderHook(() => 
      useAutoSave(testData, null, 1000)
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // No error should be thrown, just no save attempt
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  test('should prevent concurrent saves', async () => {
    const slowSaveFunction = jest.fn(() => 
      new Promise(resolve => setTimeout(resolve, 2000))
    );

    const testData = { name: 'Test Node' };
    const { result } = renderHook(() => 
      useAutoSave(testData, slowSaveFunction, 1000)
    );

    // Start first save
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isSaving).toBe(true);

    // Try manual save while auto-save is in progress
    const manualSaveResult = await act(async () => {
      return await result.current.saveNow();
    });

    // Manual save should be skipped
    expect(manualSaveResult).toBe(false);
    expect(slowSaveFunction).toHaveBeenCalledTimes(1);
  });
});