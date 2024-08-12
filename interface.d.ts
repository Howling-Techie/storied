import {Chapter, Character, Project, Scene, Location} from "./src/utils/types";

export interface IElectronAPI {
    // Project functions
    createProject: (newProject: Omit<Project, "id">) => Promise<void>;
    getProjects: () => Promise<Project[]>;
    getProject: (projectId: number) => Promise<Project>;

    // Chapter functions
    getChapters: (projectId: number) => Promise<Chapter[]>;
    getChapter: (projectId: number, id: number) => Promise<Chapter>;
    insertChapter: (chapter: Omit<Chapter, "id" | "filename">) => Promise<void>;
    updateChapter: (updatedChapter: Chapter) => Promise<void>;
    deleteChapter: (projectId: number, id: number) => Promise<void>;
    reorderChapters: (projectId: number, newOrder: Chapter[]) => Promise<void>;

    // Scene functions
    getScenes: (projectId: number) => Promise<Scene[]>;
    getScene: (projectId: number, chapterId: number, id: number) => Promise<Scene>;
    insertScene: (scene: Omit<Scene, "id" | "filename">) => Promise<void>;
    updateScene: (updatedScene: Scene) => Promise<void>;
    deleteScene: (projectId: number, chapterId: number, id: number) => Promise<void>;
    reorderScenes: (projectId: number, newOrder: Scene[]) => Promise<void>;

    // Location functions
    getLocations: (projectId: number) => Promise<Location[]>;
    getLocation: (projectId: number, id: number) => Promise<Location>;
    insertLocation: (location: Omit<Location, "id" | "filename">) => Promise<void>;
    updateLocation: (updatedLocation: Location) => Promise<void>;
    deleteLocation: (projectId: number, id: number) => Promise<void>;

    // Character functions
    getCharacters: (projectId: number) => Promise<Character[]>;
    getCharacter: (projectId: number, id: number) => Promise<Character>;
    insertCharacter: (character: Omit<Character, "id" | "filename">) => Promise<void>;
    updateCharacter: (updatedCharacter: Character) => Promise<void>;
    deleteCharacter: (projectId: number, id: number) => Promise<void>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}