import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CharacterType } from '../../types/branching-schema';

interface CharacterTypesState {
  characterTypes: CharacterType[];
  selectedCharacterTypeId: string | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

const initialState: CharacterTypesState = {
  characterTypes: [],
  selectedCharacterTypeId: null,
  loading: false,
  error: null,
  lastUpdated: Date.now(),
};

const characterTypesSlice = createSlice({
  name: 'characterTypes',
  initialState,
  reducers: {
    setCharacterTypes: (state, action: PayloadAction<CharacterType[]>) => {
      state.characterTypes = action.payload;
      state.lastUpdated = Date.now();
      state.loading = false;
      state.error = null;
    },
    addCharacterType: (state, action: PayloadAction<CharacterType>) => {
      state.characterTypes.push(action.payload);
      state.lastUpdated = Date.now();
    },
    updateCharacterType: (state, action: PayloadAction<CharacterType>) => {
      const index = state.characterTypes.findIndex(ct => ct.id === action.payload.id);
      if (index !== -1) {
        state.characterTypes[index] = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    deleteCharacterType: (state, action: PayloadAction<string>) => {
      state.characterTypes = state.characterTypes.filter(ct => ct.id !== action.payload);
      if (state.selectedCharacterTypeId === action.payload) {
        state.selectedCharacterTypeId = null;
      }
      state.lastUpdated = Date.now();
    },
    selectCharacterType: (state, action: PayloadAction<string | null>) => {
      state.selectedCharacterTypeId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    loadFromStorage: (state, action: PayloadAction<CharacterTypesState>) => {
      return { ...action.payload, lastUpdated: Date.now() };
    },
  },
});

export const {
  setCharacterTypes,
  addCharacterType,
  updateCharacterType,
  deleteCharacterType,
  selectCharacterType,
  setLoading,
  setError,
  loadFromStorage,
} = characterTypesSlice.actions;

// Selectors
export const selectAllCharacterTypes = (state: { characterTypes: CharacterTypesState }) => 
  state.characterTypes.characterTypes;

export const selectCharacterTypeById = (id: string) => (state: { characterTypes: CharacterTypesState }) => 
  state.characterTypes.characterTypes.find(ct => ct.id === id);

export const selectSelectedCharacterType = (state: { characterTypes: CharacterTypesState }) => 
  state.characterTypes.selectedCharacterTypeId 
    ? state.characterTypes.characterTypes.find(ct => ct.id === state.characterTypes.selectedCharacterTypeId)
    : null;

export const selectCharacterTypesByCategory = (category: string) => (state: { characterTypes: CharacterTypesState }) => 
  state.characterTypes.characterTypes.filter(ct => ct.category === category);

export const selectCharacterTypesLoading = (state: { characterTypes: CharacterTypesState }) => 
  state.characterTypes.loading;

export const selectCharacterTypesError = (state: { characterTypes: CharacterTypesState }) => 
  state.characterTypes.error;

export default characterTypesSlice.reducer; 