/**
 * Frontend API client
 * All data fetching should go through this module, not direct store imports
 */

export const api = {
  /**
   * Fetch all templates
   */
  getTemplates: async () => {
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) {
        throw new Error(`Failed to fetch templates: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Fetch a single template by ID or slug
   */
  getTemplate: async (idOrSlug: string) => {
    try {
      const res = await fetch(`/api/templates/${idOrSlug}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch template: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  /**
   * Fetch all stories
   */
  getStories: async () => {
    try {
      const res = await fetch('/api/stories');
      if (!res.ok) {
        throw new Error(`Failed to fetch stories: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },

  /**
   * Fetch user's stories
   */
  getUserStories: async () => {
    try {
      const res = await fetch('/api/stories/user');
      if (!res.ok) {
        throw new Error(`Failed to fetch user stories: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  },

  /**
   * Save a new or updated story
   */
  saveStory: async (story: any) => {
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story),
      });
      if (!res.ok) {
        throw new Error(`Failed to save story: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error saving story:', error);
      throw error;
    }
  },

  /**
   * Get announcements
   */
  getAnnouncements: async () => {
    try {
      const res = await fetch('/api/announcements');
      if (!res.ok) {
        throw new Error(`Failed to fetch announcements: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },
};
