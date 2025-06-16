import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DialogState {
  open: boolean;
  type: 'create' | 'edit' | 'delete' | 'confirm' | null;
  data?: any;
}

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  activeView: 'interactions' | 'characters' | 'nodes' | 'categories' | 'settings';
  dialog: DialogState;
  notifications: NotificationState[];
  isFullscreen: boolean;
  selectedTab: number;
  searchQuery: string;
  viewMode: 'list' | 'grid' | 'tree';
  filterPanelOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  activeView: 'interactions',
  dialog: {
    open: false,
    type: null,
  },
  notifications: [],
  isFullscreen: false,
  selectedTab: 0,
  searchQuery: '',
  viewMode: 'list',
  filterPanelOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setActiveView: (state, action: PayloadAction<UIState['activeView']>) => {
      state.activeView = action.payload;
    },
    openDialog: (state, action: PayloadAction<{ type: DialogState['type']; data?: any }>) => {
      state.dialog = {
        open: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    closeDialog: (state) => {
      state.dialog = {
        open: false,
        type: null,
        data: undefined,
      };
    },
    addNotification: (state, action: PayloadAction<Omit<NotificationState, 'id'>>) => {
      const notification: NotificationState = {
        ...action.payload,
        id: Date.now().toString(),
        duration: action.payload.duration || 5000,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setSelectedTab: (state, action: PayloadAction<number>) => {
      state.selectedTab = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action: PayloadAction<UIState['viewMode']>) => {
      state.viewMode = action.payload;
    },
    toggleFilterPanel: (state) => {
      state.filterPanelOpen = !state.filterPanelOpen;
    },
    setFilterPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.filterPanelOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setActiveView,
  openDialog,
  closeDialog,
  addNotification,
  removeNotification,
  clearNotifications,
  setFullscreen,
  toggleFullscreen,
  setSelectedTab,
  setSearchQuery,
  setViewMode,
  toggleFilterPanel,
  setFilterPanelOpen,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectActiveView = (state: { ui: UIState }) => state.ui.activeView;
export const selectDialog = (state: { ui: UIState }) => state.ui.dialog;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectIsFullscreen = (state: { ui: UIState }) => state.ui.isFullscreen;
export const selectSelectedTab = (state: { ui: UIState }) => state.ui.selectedTab;
export const selectSearchQuery = (state: { ui: UIState }) => state.ui.searchQuery;
export const selectViewMode = (state: { ui: UIState }) => state.ui.viewMode;
export const selectFilterPanelOpen = (state: { ui: UIState }) => state.ui.filterPanelOpen;

export default uiSlice.reducer; 