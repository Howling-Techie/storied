import fs from "fs/promises";
import * as path from "path";
import {Chapter, Character, Location, Project, Scene} from "./types";
import projects from "../pages/Projects";

// Define folder paths
const BASE_DIR = path.join("resources", "Projects");
const LOCATIONS_DIR = "Locations";
const CHARACTERS_DIR = "Characters";
const CHAPTERS_DIR = "Chapters";
const SCENES_DIR = "Scenes";

// Utility functions
const createProjectDir = async (projectName: string) => {
    const projectPath = path.join(BASE_DIR, projectName);
    await fs.mkdir(projectPath, {recursive: true});
    await fs.mkdir(path.join(projectPath, LOCATIONS_DIR));
    await fs.mkdir(path.join(projectPath, CHARACTERS_DIR));
    await fs.mkdir(path.join(projectPath, CHAPTERS_DIR));
    await fs.mkdir(path.join(projectPath, SCENES_DIR));
    await writeJsonFile(path.join(projectPath, LOCATIONS_DIR), "locations.json", []);
    await writeJsonFile(path.join(projectPath, CHARACTERS_DIR), "characters.json", []);
    await writeJsonFile(path.join(projectPath, CHAPTERS_DIR), "chapters.json", []);
    await writeJsonFile(path.join(projectPath, SCENES_DIR), "scenes.json", []);
};

const readJsonFile = async (dir: string, filename: string) => {
    try {
        const filePath = path.join(dir, filename);
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.log(err);
        return [];
    }
};

const writeJsonFile = async (dir: string, filename: string, data: Chapter[] | Character[] | Location[] | Project[] | Scene[]) => {
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const readMarkdownFile = async (filePath: string) => {
    try {
        return await fs.readFile(filePath, "utf8");
    } catch (err) {
        return "";
    }
};

const generateNextId = (items: {
    id: number
}[]) => (items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 0);

// PROJECTS
const createProject = async (newProject: Omit<Project, "id">) => {
    const {name} = newProject;
    await createProjectDir(name);
    const projects = await getProjects();
    const newId = generateNextId(projects);
    const project = {...newProject, id: newId};
    projects.push(project);
    await writeJsonFile(BASE_DIR, "projects.json", projects);
};

const getProjects = async (): Promise<Project[]> => {
    const projects: Project[] = await readJsonFile(BASE_DIR, "projects.json");
    return projects.map(p => ({
        ...p,
        creation_date: new Date(p.creation_date),
        last_modified: new Date(p.creation_date)
    }));
};

const getProject = async (projectId: number): Promise<Project | null> => {
    const projects = await getProjects();
    return projects.find(proj => proj.id === projectId) || null;
};

const getProjectPath = async (projectId: number): Promise<string | null> => {
    const project = await getProject(projectId);
    return path.join(BASE_DIR, project.name);
};


// LOCATIONS
const getLocations = async (projectId: number): Promise<Location[]> => {
    const projectPath = path.join(await getProjectPath(projectId), LOCATIONS_DIR);
    return await readJsonFile(projectPath, "locations.json");
};

const getLocation = async (projectId: number, id: number): Promise<Location | null> => {
    const projectPath = path.join(await getProjectPath(projectId), LOCATIONS_DIR);
    const locations = await getLocations(projectId);
    const location = locations.find(loc => loc.id === id);
    if (location) {
        return {
            ...location,
            text: await readMarkdownFile(path.join(projectPath, location.filename))
        };
    }
    return null;
};

const insertLocation = async (location: Omit<Location, "id" | "filename">) => {

    const projectPath = path.join(await getProjectPath(location.project_id), LOCATIONS_DIR);
    const locations = await getLocations(location.project_id);
    const newId = generateNextId(locations);
    const filename = `${location.name.replace(/\s+/g, "_")}.md`;
    const newLocation = {...location, id: newId, filename};
    locations.push(newLocation);
    await writeJsonFile(projectPath, "locations.json", locations);
    await fs.writeFile(path.join(projectPath, filename), location.text || "");
};

const updateLocation = async (updatedLocation: Location) => {
    const projectPath = path.join(await getProjectPath(updatedLocation.project_id), LOCATIONS_DIR);
    const locations = await getLocations(updatedLocation.project_id);
    const index = locations.findIndex(loc => loc.id === updatedLocation.id);
    if (index !== -1) {
        // Update the location metadata
        const oldLocation = locations[index];
        updatedLocation.filename = `${updatedLocation.name.replace(/\s+/g, "_")}.md`;
        // Delete the Markdown file if the filename will be changed
        if (oldLocation.filename !== updatedLocation.filename) {
            const oldFilePath = path.join(projectPath, oldLocation.filename);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.error(`Error deleting file: ${err}`);
            }
        }
        locations[index] = updatedLocation;
        await writeJsonFile(projectPath, "locations.json", locations);
        await fs.writeFile(path.join(projectPath, updatedLocation.filename), updatedLocation.text || "");
    }
};

const deleteLocation = async (projectId: number, id: number) => {
    const projectPath = path.join(await getProjectPath(projectId), LOCATIONS_DIR);
    const locations = await getLocations(projectId);
    const location = locations.find((loc: Location) => loc.id === id);
    if (location) {
        const updatedLocations = locations.filter((loc: Location) => loc.id !== id);
        await writeJsonFile(projectPath, "locations.json", updatedLocations);
        const markdownFile = path.join(projectPath, location.filename);
        try {
            await fs.unlink(markdownFile);
        } catch (err) {
            console.error(`Error deleting file: ${err}`);
        }
    }
};

// CHARACTERS
const getCharacters = async (projectId: number): Promise<Character[]> => {
    const projectPath = path.join(await getProjectPath(projectId), CHARACTERS_DIR);
    return await readJsonFile(projectPath, "characters.json");
};

const getCharacter = async (projectId: number, id: number): Promise<Character | null> => {
    const projectPath = path.join(await getProjectPath(projectId), CHARACTERS_DIR);
    const characters = await getCharacters(projectId);
    const character = characters.find(char => char.id === id);
    if (character) {
        return {
            ...character,
            text: await readMarkdownFile(path.join(projectPath, character.filename))
        };
    }
    return null;
};

const insertCharacter = async (character: Omit<Character, "id" | "filename">) => {
    const projectPath = path.join(await getProjectPath(character.project_id), CHARACTERS_DIR);
    const characters = await getCharacters(character.project_id);
    const newId = generateNextId(characters);
    const filename = `${character.name.replace(/\s+/g, "_")}.md`;
    const newCharacter = {...character, id: newId, filename};
    characters.push(newCharacter);
    await writeJsonFile(projectPath, "characters.json", characters);
    await fs.writeFile(path.join(projectPath, filename), character.text || "");
};

const updateCharacter = async (updatedCharacter: Character) => {
    const projectPath = path.join(await getProjectPath(updatedCharacter.project_id), CHARACTERS_DIR);
    const characters = await getCharacters(updatedCharacter.project_id);
    const index = characters.findIndex(char => char.id === updatedCharacter.id);
    if (index !== -1) {
        // Update the character metadata
        const oldCharacter = characters[index];
        updatedCharacter.filename = `${updatedCharacter.name.replace(/\s+/g, "_")}.md`;
        // Delete the Markdown file if the filename will be changed
        if (oldCharacter.filename !== updatedCharacter.filename) {
            const oldFilePath = path.join(projectPath, oldCharacter.filename);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.error(`Error deleting file: ${err}`);
            }
        }
        characters[index] = updatedCharacter;
        await writeJsonFile(projectPath, "characters.json", characters);
        await fs.writeFile(path.join(projectPath, updatedCharacter.filename), updatedCharacter.text || "");
    }
};

const deleteCharacter = async (projectId: number, id: number) => {
    const projectPath = path.join(await getProjectPath(projectId), CHARACTERS_DIR);
    const characters = await getCharacters(projectId);
    const character = characters.find(char => char.id === id);
    if (character) {
        const updatedCharacters = characters.filter(char => char.id !== id);
        await writeJsonFile(projectPath, "characters.json", updatedCharacters);
        const markdownFile = path.join(projectPath, character.filename);
        try {
            await fs.unlink(markdownFile);
        } catch (err) {
            console.error(`Error deleting file: ${err}`);
        }
    }
};

// CHAPTERS
const getChapters = async (projectId: number): Promise<Chapter[]> => {
    const projectPath = path.join(await getProjectPath(projectId), CHAPTERS_DIR);
    return await readJsonFile(projectPath, "chapters.json");
};

const getChapter = async (projectId: number, id: number): Promise<Chapter | null> => {
    const projectPath = path.join(await getProjectPath(projectId), CHAPTERS_DIR);
    const chapters = await getChapters(projectId);
    const chapter = chapters.find(chap => chap.id === id);
    if (chapter) {
        return {
            ...chapter,
            text: await readMarkdownFile(path.join(projectPath, chapter.filename))
        };
    }
    return null;
};

const insertChapter = async (chapter: Omit<Chapter, "id" | "filename">) => {
    const projectPath = path.join(await getProjectPath(chapter.project_id), CHAPTERS_DIR);
    const chapters = await getChapters(chapter.project_id);
    const newId = generateNextId(chapters);
    const filename = `CHAPTER_${chapter.position}_${chapter.name.replace(/\s+/g, "_")}.md`;
    const newChapter = {...chapter, id: newId, filename};
    chapters.push(newChapter);
    await writeJsonFile(projectPath, "chapters.json", chapters);
    await fs.writeFile(path.join(projectPath, filename), chapter.text || "");
};

const updateChapter = async (updatedChapter: Chapter) => {
    const projectPath = path.join(await getProjectPath(updatedChapter.project_id), CHAPTERS_DIR);
    const chapters = await getChapters(updatedChapter.project_id);
    const index = chapters.findIndex(chap => chap.id === updatedChapter.id);
    if (index !== -1) {
        // Update the chapter metadata
        const oldChapter = chapters[index];
        updatedChapter.filename = `CHAPTER_${updatedChapter.position}_${updatedChapter.name.replace(/\s+/g, "_")}.md`;
        // Delete the Markdown file if the filename will be changed
        if (oldChapter.filename !== updatedChapter.filename) {
            const oldFilePath = path.join(projectPath, oldChapter.filename);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.error(`Error deleting file: ${err}`);
            }
        }
        chapters[index] = updatedChapter;
        await writeJsonFile(projectPath, "chapters.json", chapters);
        await fs.writeFile(path.join(projectPath, updatedChapter.filename), updatedChapter.text || "");
    }
};

const deleteChapter = async (projectId: number, id: number) => {
    const projectPath = path.join(await getProjectPath(projectId), CHAPTERS_DIR);
    const chapters = await getChapters(projectId);
    const chapter = chapters.find((chap: Chapter) => chap.id === id);
    if (chapter) {
        const updatedChapters = chapters.filter((chap: Chapter) => chap.id !== id);
        await writeJsonFile(projectPath, "chapters.json", updatedChapters);
        const markdownFile = path.join(projectPath, chapter.filename);
        try {
            await fs.unlink(markdownFile);
        } catch (err) {
            console.error(`Error deleting file: ${err}`);
        }
    }
};

const reorderChapters = async (projectId: number, newOrder: Chapter[]) => {
    const projectPath = path.join(await getProjectPath(projectId), CHAPTERS_DIR);
    const oldChapters = await getChapters(projectId);
    // Update the positions and filenames of chapters
    for (const chapter of newOrder) {
        const oldChapter = oldChapters.find(chap => chap.id === chapter.id);
        if (oldChapter) {
            const oldMarkdownFilePath = path.join(projectPath, oldChapter.filename);
            oldChapter.filename = `CHAPTER_${chapter.position}_${chapter.name.replace(/\s+/g, "_")}.md`;
            const newMarkdownFilePath = path.join(projectPath, oldChapter.filename);
            try {
                await fs.rename(oldMarkdownFilePath, newMarkdownFilePath);
            } catch (err) {
                console.error(`Error renaming file: ${err}`);
            }
            oldChapter.position = chapter.position;
        }
    }
    await writeJsonFile(projectPath, "chapters.json", oldChapters);
};

// SCENES
const getScenes = async (projectId: number): Promise<Scene[]> => {
    const projectPath = path.join(await getProjectPath(projectId), SCENES_DIR);
    return await readJsonFile(projectPath, "scenes.json");
};

const getScene = async (projectId: number, chapterId: number, id: number): Promise<Scene | null> => {
    const projectPath = path.join(await getProjectPath(projectId), SCENES_DIR);
    const scenes = await getScenes(projectId);
    const scene = scenes.find(sc => sc.chapter_id === chapterId && sc.id === id);
    if (scene) {
        console.log(`Reading file @ ${path.join(projectPath, scene.filename)}`);
        return {
            ...scene,
            text: await readMarkdownFile(path.join(projectPath, scene.filename))
        };
    }
    return null;
};

const insertScene = async (scene: Omit<Scene, "id" | "filename">) => {
    const projectPath = path.join(await getProjectPath(scene.project_id), SCENES_DIR);
    const scenes = await getScenes(scene.project_id);
    const newId = generateNextId(scenes);
    const chapterPosition = (await getChapter(scene.project_id, scene.chapter_id)).position;
    const filename = `CHAPTER_${chapterPosition}_SCENE_${scene.position}_${scene.name.replace(/\s+/g, "_")}.md`;
    const newScene = {...scene, id: newId, filename};
    scenes.push(newScene);
    await writeJsonFile(projectPath, "scenes.json", scenes);
    await fs.writeFile(path.join(projectPath, filename), scene.text || "");
};

const updateScene = async (updatedScene: Scene) => {
    const projectPath = path.join(await getProjectPath(updatedScene.project_id), SCENES_DIR);
    const scenes = await getScenes(updatedScene.project_id);
    const index = scenes.findIndex(sc => sc.id === updatedScene.id);
    if (index !== -1) {
        // Update the scene metadata
        const oldScene = scenes[index];
        scenes[index] = updatedScene;
        // Delete the Markdown file if the filename will be changed
        if (oldScene.filename !== updatedScene.filename) {
            const oldFilePath = path.join(projectPath, oldScene.filename);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.error(`Error deleting file: ${err}`);
            }
        }
        await writeJsonFile(projectPath, "scenes.json", scenes);
        await fs.writeFile(path.join(projectPath, updatedScene.filename), updatedScene.text || "");
    }
};

const deleteScene = async (projectId: number, chapterId: number, id: number) => {
    const projectPath = path.join(await getProjectPath(projectId), SCENES_DIR);
    const scenes = await getScenes(projectId);
    const scene = scenes.find(sc => sc.chapter_id === chapterId && sc.id === id);
    if (scene) {
        const updatedScenes = scenes.filter(sc => !(sc.chapter_id === chapterId && sc.id === id));
        await writeJsonFile(projectPath, "scenes.json", updatedScenes);
        const markdownFile = path.join(projectPath, scene.filename);
        try {
            await fs.unlink(markdownFile);
        } catch (err) {
            console.error(`Error deleting file: ${err}`);
        }
    }
};

const reorderScenes = async (projectId: number, newOrder: Scene[]) => {
    const projectPath = path.join(await getProjectPath(projectId), SCENES_DIR);
    const oldScenes = await getScenes(projectId);
    const chapters = await getChapters(projectId);
    // Update the positions and filenames of scenes
    for (const scene of newOrder) {
        const oldScene = oldScenes.find(sc => sc.id === scene.id);
        if (oldScene) {
            const oldMarkdownFilePath = path.join(projectPath, oldScene.filename);
            oldScene.filename = `CHAPTER_${chapters.find(chap => chap.id === scene.chapter_id).position}_SCENE_${scene.position}_${scene.name.replace(/\s+/g, "_")}.md`;
            const newMarkdownFilePath = path.join(projectPath, oldScene.filename);
            try {
                await fs.rename(oldMarkdownFilePath, newMarkdownFilePath);
            } catch (err) {
                console.error(`Error renaming file: ${err}`);
            }
            oldScene.position = scene.position;
            oldScene.name = scene.name;
            oldScene.chapter_id = scene.chapter_id;
        }
    }
    await writeJsonFile(projectPath, "scenes.json", oldScenes);
};

export const fileFunctions = {
    projects: {createProject, getProjects, getProject},
    locations: {getLocations, getLocation, insertLocation, updateLocation, deleteLocation},
    characters: {getCharacters, getCharacter, insertCharacter, updateCharacter, deleteCharacter},
    chapters: {getChapters, getChapter, insertChapter, updateChapter, deleteChapter, reorderChapters},
    scenes: {getScenes, getScene, insertScene, updateScene, deleteScene, reorderScenes},
};