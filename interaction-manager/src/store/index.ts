import { configureStore } from '@reduxjs/toolkit';
import interactionsReducer from './slices/interactionsSlice';
import characterTypesReducer from './slices/characterTypesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    interactions: interactionsReducer,
    characterTypes: characterTypesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['interactions/loadFromStorage', 'characterTypes/loadFromStorage'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['interactions.lastUpdated', 'characterTypes.lastUpdated'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 