/**
 * Tools (Sandbox) 状態管理ストア
 * プロジェクト一覧、Gallery、ソート状態を管理
 */
import { create } from 'zustand';
import { createToolsActions } from './tools/actions';

export const useToolsStore = create((set, get) => ({
    // State
    projects: [],           // 自分のプロジェクト
    gallery: [],            // 公開プロジェクト（Gallery）
    activeProject: null,    // 現在編集中のプロジェクト
    sortBy: 'popular',      // popular, newest, oldest
    loading: false,
    error: null,
    sandboxHealth: null,

    // Actions
    ...createToolsActions(set, get),
}));

export default useToolsStore;
