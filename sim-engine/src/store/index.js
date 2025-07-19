// Redux store configuration
// TODO: Implement actual Redux store when needed

import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducer - replace with actual reducers when implemented
const placeholderReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TEMPLATE':
      return {
        ...state,
        activeTemplate: action.payload
      };
    default:
      return state;
  }
};

// Configure store with placeholder reducer
const store = configureStore({
  reducer: {
    templates: placeholderReducer,
    // Add more reducers here as they are implemented
    // simulation: simulationReducer,
    // worldBuilder: worldBuilderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
