import { writable, type Writable } from 'svelte/store';
import type { NavigationState, ViewType } from '$lib/types';

// Default navigation state
const defaultNavigationState: NavigationState = {
  currentView: 'perspective' as ViewType,
  currentPerspectiveId: undefined,
  currentProjectId: undefined
};

// Create the navigation store as a single source of truth
function createNavigationStore() {
  const { subscribe, set, update } = writable<NavigationState>(defaultNavigationState);

  return {
    subscribe,
    
    // Set entire navigation state
    set,
    
    // Update navigation state
    update,
    
    // Convenience methods for common operations
    setView(view: ViewType, perspectiveId?: string, projectId?: string) {
      update(state => ({
        ...state,
        currentView: view,
        currentPerspectiveId: perspectiveId,
        currentProjectId: projectId
      }));
    },
    
    setPerspectiveView(perspectiveId: string) {
      update(state => ({
        ...state,
        currentView: 'perspective',
        currentPerspectiveId: perspectiveId,
        currentProjectId: undefined
      }));
    },
    
    setProjectView(projectId: string) {
      update(state => ({
        ...state,
        currentView: 'project',
        currentPerspectiveId: undefined,
        currentProjectId: projectId
      }));
    },
    
    setAllView() {
      update(state => ({
        ...state,
        currentView: 'all',
        currentPerspectiveId: undefined,
        currentProjectId: undefined
      }));
    },
    
    setProjectAllView() {
      update(state => ({
        ...state,
        currentView: 'project-all',
        currentPerspectiveId: undefined,
        currentProjectId: undefined
      }));
    },
    
    // Reset to default state
    reset() {
      set(defaultNavigationState);
    }
  };
}

// Export the singleton navigation store
export const navigation = createNavigationStore();