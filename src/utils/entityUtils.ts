import fs from "fs/promises";
import * as path from "path";
import {BaseEntity, Chapter, Character, EntityType, Location, Project, Scene} from "./types";

// Define entity info
const BASE_DIR = path.join("resources");
const EntityInfo: { [index: string]: { directory: string, filename: string } } = {
    Location: {
        directory: "Locations",
        filename: "locations.json"
    },
    Character: {
        directory: "Characters",
        filename: "characters.json"
    },
    Chapter: {
        directory: "Chapters",
        filename: "chapters.json"
    },
    Story: {
        directory: "Stories",
        filename: "stories.json"
    },
    Scene: {
        directory: "Scenes",
        filename: "scenes.json"
    },
    Event: {
        directory: "Events",
        filename: "events.json"
    }
};

// Utility functions
const readJsonFile = async <Entity extends BaseEntity>(filePath: string): Promise<Array<Entity>> => {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.log(err);
        return [];
    }
};

const writeJsonFile = async <Entity extends BaseEntity>(filePath: string, data: Array<Entity>) => {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const readMarkdownFile = async (filePath: string): Promise<string> => {
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
const getProjectPath = async (projectId: number): Promise<string | null> => {
    const project = await getProject(projectId);
    return path.join(BASE_DIR, EntityInfo.Project.directory, project.name);
};

const createProjectDir = async (projectName: string) => {
    const projectPath = path.join(BASE_DIR, EntityInfo.Project.directory, projectName);
    await fs.mkdir(projectPath, {recursive: true});
    for (const entityType in EntityInfo) {
        if (entityType === "Project")
            continue;
        await fs.mkdir(path.join(projectPath, EntityInfo[entityType].directory));
        await writeJsonFile(path.join(projectPath, EntityInfo[entityType].directory, EntityInfo[entityType].filename), []);
    }
};

const createProject = async (newProject: Omit<Project, "id">) => {
    const {name} = newProject;
    await createProjectDir(name);
    const projects = await getProjects();
    const newId = generateNextId(projects);
    const project = {...newProject, id: newId};
    projects.push(project);
    await fs.writeFile(path.join(EntityInfo["Project"].directory, "projects.json"), JSON.stringify(projects, null, 2), "utf8");
};

const getProjects = async (): Promise<Project[]> => {
    try {
        const data = await fs.readFile(path.join(BASE_DIR, EntityInfo["Project"].directory, EntityInfo["Project"].filename), "utf8");
        const projects: Project[] = JSON.parse(data);
        return projects.map(p => ({
            ...p,
            creation_date: new Date(p.creation_date),
            last_modified: new Date(p.creation_date),
        }));
    } catch (err) {
        console.log(err);
        return [];
    }
};

const getProject = async (projectId: number): Promise<Project | null> => {
    const projects = await getProjects();
    return projects.find(proj => proj.id === projectId) || null;
};

// ENTITY HANDLING
const getEntities = async <Entity extends BaseEntity>(entityType: EntityType, projectId: number): Promise<Entity[]> => {
    const projectPath = await getProjectPath(projectId);
    const entitiesPath = path.join(projectPath, EntityInfo[entityType].directory, EntityInfo[entityType].filename);
    const entities = await readJsonFile<Entity>(entitiesPath);
    return entities.map(e => ({
        ...e,
        creation_date: new Date(e.creation_date),
        last_modified: new Date(e.creation_date),
    }));
};

const getEntity = async <Entity extends BaseEntity>(entityType: EntityType, projectId: number, entityId: number): Promise<Entity> => {
    const projectPath = await getProjectPath(projectId);
    const entities = await getEntities<Entity>(entityType, projectId);
    const entity = entities.find((entity: Entity) => entity.id === entityId);
    if (entity) {
        return {
            ...entity,
            text: await readMarkdownFile(path.join(projectPath, EntityInfo[entityType].directory, entity.filename))
        };
    }
    throw new Error(`Entity with id ${entityId} not found`);
};

const insertEntity = async <Entity extends BaseEntity>(entityType: EntityType, entity: Omit<Entity, "id" | "filename">) => {
    const projectPath = await getProjectPath(entity.project_id);
    const entities = await getEntities<Entity>(entityType, entity.project_id);
    const newId = generateNextId(entities);
    const filename = `${entityType}_${entity.name.replace(/[^a-z0-9]/gi, "_")}.md`;
    const newEntity: Entity = {...entity, id: newId, filename} as Entity;
    if ("chapter_id" in entity) {
        const chapter = (await getEntity<Chapter>("Chapter", entity.project_id, (newEntity as unknown as Scene).chapter_id));
        newEntity.filename = `Chapter_${chapter.position}_` + filename;
    }
    entities.push(newEntity);
    await writeJsonFile<Entity>(path.join(projectPath, EntityInfo[entityType].directory, EntityInfo[entityType].filename), entities);
    await fs.writeFile(path.join(projectPath, EntityInfo[entityType].directory, filename), entity.text || "");
};

const updateEntity = async <Entity extends BaseEntity>(entityType: EntityType, updatedEntity: Entity) => {
    const projectPath = await getProjectPath(updatedEntity.project_id);
    const entities = await getEntities<Entity>(entityType, updatedEntity.project_id);
    const index = entities.findIndex(ent => ent.id === updatedEntity.id);
    if (index !== -1) {
        // Update the entity metadata
        const oldEntity = entities[index];
        updatedEntity.filename = `${updatedEntity.name.replace(/\s+/g, "_")}.md`;
        // Delete the Markdown file if the filename will be changed
        if (oldEntity.filename !== updatedEntity.filename) {
            const oldFilePath = path.join(projectPath, EntityInfo[entityType].directory, oldEntity.filename);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.error(`Error deleting file: ${err}`);
            }
        }
        entities[index] = updatedEntity;
        await writeJsonFile(path.join(projectPath, EntityInfo[entityType].directory, EntityInfo[entityType].filename), entities);
        await fs.writeFile(path.join(projectPath, EntityInfo[entityType].directory, updatedEntity.filename), updatedEntity.text || "");
    }
};

const deleteEntity = async <Entity extends BaseEntity>(entityType: EntityType, projectId: number, id: number) => {
    const projectPath = await getProjectPath(projectId);
    const entities = await getEntities<Entity>(entityType, projectId);
    const entity = entities.find(ent => ent.id === id);
    if (entity) {
        const updatedEntities = entities.filter(ent => ent.id !== id);
        await writeJsonFile(path.join(projectPath, EntityInfo[entityType].directory, EntityInfo[entityType].filename), updatedEntities);
        const markdownFile = path.join(projectPath, EntityInfo[entityType].directory, entity.filename);
        try {
            await fs.unlink(markdownFile);
        } catch (err) {
            console.error(`Error deleting file: ${err}`);
        }
    }
};