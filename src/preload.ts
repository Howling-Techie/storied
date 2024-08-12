// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {contextBridge, ipcRenderer} from "electron";
import {Character, Project, Location, Chapter, Scene} from "./utils/types";

contextBridge.exposeInMainWorld("electronAPI", {
    // Project functions
    createProject: (newProject: Project) => ipcRenderer.invoke("projects:createProject", newProject),
    getProjects: () => ipcRenderer.invoke("projects:getProjects"),
    getProject: (projectId: number) => ipcRenderer.invoke("projects:getProject", projectId),

    // Chapter functions
    getChapters: (projectId: number) => ipcRenderer.invoke("chapters:getChapters", projectId),
    getChapter: (projectId: number, id: number) => ipcRenderer.invoke("chapters:getChapter", projectId, id),
    insertChapter: (chapter: Omit<Chapter, "id" | "filename">) => ipcRenderer.invoke("chapters:insertChapter", chapter),
    updateChapter: (updatedChapter: Chapter) => ipcRenderer.invoke("chapters:updateChapter", updatedChapter),
    deleteChapter: (projectId: number, id: number) => ipcRenderer.invoke("chapters:deleteChapter", projectId, id),
    reorderChapters: (projectId: number, newOrder: Chapter[]) => ipcRenderer.invoke("chapters:reorderChapters", projectId, newOrder),

    // Scene functions
    getScenes: (projectId: number) => ipcRenderer.invoke("scenes:getScenes", projectId),
    getScene: (projectId: number, chapterId: number, id: number) => ipcRenderer.invoke("scenes:getScene", projectId, chapterId, id),
    insertScene: (scene: Omit<Scene, "id" | "filename">) => ipcRenderer.invoke("scenes:insertScene", scene),
    updateScene: (updatedScene: Scene) => ipcRenderer.invoke("scenes:updateScene", updatedScene),
    deleteScene: (projectId: number, chapterId: number, id: number) => ipcRenderer.invoke("scenes:deleteScene", projectId, chapterId, id),
    reorderScenes: (projectId: number, newOrder: Scene[]) => ipcRenderer.invoke("scenes:reorderScenes", projectId, newOrder),

    // Location functions
    getLocations: (projectId: number) => ipcRenderer.invoke("locations:getLocations", projectId),
    getLocation: (projectId: number, id: number) => ipcRenderer.invoke("locations:getLocation", projectId, id),
    insertLocation: (location: Omit<Location, "id" | "filename">) => ipcRenderer.invoke("locations:insertLocation", location),
    updateLocation: (updatedLocation: Location) => ipcRenderer.invoke("locations:updateLocation", updatedLocation),
    deleteLocation: (projectId: number, id: number) => ipcRenderer.invoke("locations:deleteLocation", projectId, id),

    // Character functions
    getCharacters: (projectId: number) => ipcRenderer.invoke("characters:getCharacters", projectId),
    getCharacter: (projectId: number, id: number) => ipcRenderer.invoke("characters:getCharacter", projectId, id),
    insertCharacter: (character: Omit<Character, "id" | "filename">) => ipcRenderer.invoke("characters:insertCharacter", character),
    updateCharacter: (updatedCharacter: Character) => ipcRenderer.invoke("characters:updateCharacter", updatedCharacter),
    deleteCharacter: (projectId: number, id: number) => ipcRenderer.invoke("characters:deleteCharacter", projectId, id),
});