/**
 * Tools Store Actions
 * All API interaction functions for tools/sandbox
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const createToolsActions = (set, get) => ({
    // Gallery Actions
    fetchGallery: async (token = null) => {
        set({ loading: true, error: null });
        try {
            const { sortBy } = get();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API_URL}/tools/gallery?sort=${sortBy}`, { headers });
            const data = Array.isArray(res.data) ? res.data : [];
            set({ gallery: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Failed to fetch gallery:', error);
        }
    },

    setSortBy: (sortBy) => {
        set({ sortBy });
        get().fetchGallery();
    },

    // My Projects Actions
    fetchMyProjects: async (token) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/tools/my-projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = Array.isArray(res.data) ? res.data : [];
            set({ projects: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Failed to fetch my projects:', error);
        }
    },

    // Project CRUD
    createProject: async (token, projectData) => {
        try {
            const res = await axios.post(`${API_URL}/tools/projects`, projectData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({ projects: [res.data, ...state.projects] }));
            return res.data;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    },

    fetchProject: async (projectId, token = null) => {
        set({ loading: true, error: null });
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API_URL}/tools/projects/${projectId}`, { headers });
            set({ activeProject: res.data, loading: false });
            return res.data;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Failed to fetch project:', error);
            throw error;
        }
    },

    deleteProject: async (token, projectId) => {
        try {
            await axios.delete(`${API_URL}/tools/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({
                projects: state.projects.filter(p => p.id !== projectId),
                gallery: state.gallery.filter(p => p.id !== projectId)
            }));
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    },

    // Sandbox Operations
    runProject: async (token, projectId) => {
        try {
            const res = await axios.post(`${API_URL}/tools/projects/${projectId}/run`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({
                projects: state.projects.map(p =>
                    p.id === projectId ? { ...p, status: 'running' } : p
                ),
                activeProject: state.activeProject?.id === projectId
                    ? { ...state.activeProject, status: 'running' }
                    : state.activeProject
            }));
            return res.data;
        } catch (error) {
            console.error('Failed to run project:', error);
            throw error;
        }
    },

    stopProject: async (token, projectId) => {
        try {
            const res = await axios.post(`${API_URL}/tools/projects/${projectId}/stop`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => ({
                projects: state.projects.map(p =>
                    p.id === projectId ? { ...p, status: 'stopped' } : p
                ),
                activeProject: state.activeProject?.id === projectId
                    ? { ...state.activeProject, status: 'stopped' }
                    : state.activeProject
            }));
            return res.data;
        } catch (error) {
            console.error('Failed to stop project:', error);
            throw error;
        }
    },

    // Vote Actions
    voteProject: async (token, projectId, isUpvote) => {
        try {
            await axios.post(`${API_URL}/tools/projects/${projectId}/vote`,
                { is_upvote: isUpvote },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            set(state => {
                const updateVotes = (project) => {
                    if (project.id !== projectId) return project;
                    const oldVote = project.user_vote;
                    let upvotes = project.upvotes;
                    let downvotes = project.downvotes;

                    if (oldVote === true) upvotes--;
                    if (oldVote === false) downvotes--;

                    if (isUpvote) upvotes++;
                    else downvotes--;

                    return { ...project, user_vote: isUpvote, upvotes, downvotes };
                };
                return {
                    gallery: state.gallery.map(updateVotes),
                    projects: state.projects.map(updateVotes),
                    activeProject: state.activeProject ? updateVotes(state.activeProject) : null
                };
            });
        } catch (error) {
            console.error('Failed to vote:', error);
            throw error;
        }
    },

    removeVote: async (token, projectId) => {
        try {
            await axios.delete(`${API_URL}/tools/projects/${projectId}/vote`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set(state => {
                const removeVoteFromProject = (project) => {
                    if (project.id !== projectId) return project;
                    const oldVote = project.user_vote;
                    let upvotes = project.upvotes;
                    let downvotes = project.downvotes;

                    if (oldVote === true) upvotes--;
                    if (oldVote === false) downvotes--;

                    return { ...project, user_vote: null, upvotes, downvotes };
                };
                return {
                    gallery: state.gallery.map(removeVoteFromProject),
                    projects: state.projects.map(removeVoteFromProject),
                    activeProject: state.activeProject ? removeVoteFromProject(state.activeProject) : null
                };
            });
        } catch (error) {
            console.error('Failed to remove vote:', error);
            throw error;
        }
    },

    // Health Check
    checkSandboxHealth: async () => {
        try {
            const res = await axios.get(`${API_URL}/tools/health`);
            set({ sandboxHealth: res.data });
            return res.data;
        } catch (error) {
            set({ sandboxHealth: { sandbox_status: 'unreachable' } });
            console.error('Failed to check sandbox health:', error);
        }
    },

    // Utils
    clearActiveProject: () => set({ activeProject: null }),
    clearError: () => set({ error: null }),
});
