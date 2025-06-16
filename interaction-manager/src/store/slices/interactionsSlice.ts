import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Interaction } from '../../types/branching-schema';

interface InteractionsState {
  interactions: Interaction[];
  selectedInteractionId: string | null;
  loading: boolean;
  error: string | null;
  filters: {
    categoryId?: string;
    characterTypeId?: string;
    nodeId?: string;
    searchQuery?: string;
  };
  lastUpdated: number;
}

const initialState: InteractionsState = {
  interactions: [],
  selectedInteractionId: null,
  loading: false,
  error: null,
  filters: {},
  lastUpdated: Date.now(),
};

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    setInteractions: (state, action: PayloadAction<Interaction[]>) => {
      state.interactions = action.payload;
      state.lastUpdated = Date.now();
      state.loading = false;
      state.error = null;
    },
    addInteraction: (state, action: PayloadAction<Interaction>) => {
      state.interactions.push(action.payload);
      state.lastUpdated = Date.now();
    },
    updateInteraction: (state, action: PayloadAction<Interaction>) => {
      const index = state.interactions.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.interactions[index] = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    deleteInteraction: (state, action: PayloadAction<string>) => {
      state.interactions = state.interactions.filter(i => i.id !== action.payload);
      if (state.selectedInteractionId === action.payload) {
        state.selectedInteractionId = null;
      }
      state.lastUpdated = Date.now();
    },
    selectInteraction: (state, action: PayloadAction<string | null>) => {
      state.selectedInteractionId = action.payload;
    },
    setFilters: (state, action: PayloadAction<InteractionsState['filters']>) => {
      state.filters = action.payload;
    },
    updateFilter: (state, action: PayloadAction<{ key: keyof InteractionsState['filters']; value: any }>) => {
      state.filters[action.payload.key] = action.payload.value;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    loadFromStorage: (state, action: PayloadAction<InteractionsState>) => {
      return { ...action.payload, lastUpdated: Date.now() };
    },
  },
});

export const {
  setInteractions,
  addInteraction,
  updateInteraction,
  deleteInteraction,
  selectInteraction,
  setFilters,
  updateFilter,
  clearFilters,
  setLoading,
  setError,
  loadFromStorage,
} = interactionsSlice.actions;

// Selectors
export const selectAllInteractions = (state: { interactions: InteractionsState }) => state.interactions.interactions;
export const selectInteractionById = (id: string) => (state: { interactions: InteractionsState }) => 
  state.interactions.interactions.find(i => i.id === id);
export const selectSelectedInteraction = (state: { interactions: InteractionsState }) => 
  state.interactions.selectedInteractionId 
    ? state.interactions.interactions.find(i => i.id === state.interactions.selectedInteractionId)
    : null;
export const selectFilteredInteractions = (state: { interactions: InteractionsState }) => {
  const { interactions, filters } = state.interactions;
  
  return interactions.filter(interaction => {
    if (filters.categoryId && interaction.categoryId !== filters.categoryId) return false;
    if (filters.characterTypeId && interaction.characterTypeId !== filters.characterTypeId) return false;
    if (filters.nodeId && interaction.nodeId !== filters.nodeId) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        interaction.title.toLowerCase().includes(query) ||
        interaction.description.toLowerCase().includes(query) ||
        interaction.content.toLowerCase().includes(query)
      );
    }
    return true;
  });
};

export default interactionsSlice.reducer; 