import Database from "better-sqlite3";
import {BaseEntity, Chapter, Character, Event, Location, Relationship, Scene, Status, Tag, World} from "./types";

// Initialize the database
const db = new Database("storied.sqlite");

// Helper functions
const runQuery = (query: string, params: any[] = []) => {
    const stmt = db.prepare(query);
    return stmt.run(...params);
};

const getQuery = (query: string, params: any[] = []) => {
    const stmt = db.prepare(query);
    return stmt.get(...params);
};

const allQuery = (query: string, params: any[] = []) => {
    const stmt = db.prepare(query);
    return stmt.all(...params);
};

const cleanUpEntity = <Entity extends BaseEntity>(entity: Entity) => {
    for (const key in entity) {
        if (key.endsWith("_id")) {
            entity.id = entity[key] as unknown as number;
            delete entity[key];
        }
    }
    entity.last_modified = new Date(entity.last_modified);
    entity.creation_date = new Date(entity.creation_date);
    return entity;
};

// World functions
const createWorld = (name: string, description: string, icon: string | null, text: string | null, status: Status) => {
    const query = `INSERT INTO worlds (name, description, icon, text, status)
                   VALUES (?, ?, ?, ?, ?)`;
    return runQuery(query, [name, description, icon, text, status]);
};

const getWorlds = (): World[] => {
    const query = "SELECT * FROM worlds";
    return (<(World & { world_id: number })[]>allQuery(query)).map(result => {
        result.id = result.world_id;
        delete result["world_id"];
        return {
            ...result,
            creation_date: new Date(result.creation_date),
            last_modified: new Date(result.last_modified)
        };
    });
};

const getWorld = (world_id: number): World => {
    const query = "SELECT * FROM worlds WHERE world_id = ?";
    const result = <(World & { world_id: number })>getQuery(query, [world_id]);
    return {
        ...result,
        id: result.world_id,
        creation_date: new Date(result.creation_date),
        last_modified: new Date(result.last_modified)
    };
};

// Location functions
const getLocations = (world_id: number): Location[] => {
    const query = "SELECT * FROM locations WHERE world_id = ?";
    return <Location[]>allQuery(query, [world_id]).map(cleanUpEntity);
};

const getLocation = (location_id: number): Location => {
    const query = "SELECT * FROM locations WHERE location_id = ?";
    return cleanUpEntity(<Location>getQuery(query, [location_id]));
};

const insertLocation = (newLocation: Omit<Location, "id">) => {
    const {
        world_id,
        name,
        description,
        icon,
        text,
        status,
        parent_location_id
    } = newLocation;
    const query = `INSERT INTO locations (world_id, name, description, icon, text, status, parent_location_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return runQuery(query, [world_id, name, description, icon, text, status, parent_location_id]);
};

const updateLocation = (location: Location) => {
    const {
        id,
        name,
        description,
        icon,
        text,
        status,
        parent_location_id
    } = location;
    const query = `UPDATE locations
                   SET name               = ?,
                       description        = ?,
                       icon               = ?,
                       text               = ?,
                       status             = ?,
                       parent_location_id = ?,
                       last_modified      = ?
                   WHERE location_id = ?`;
    return runQuery(query, [name, description, icon, text, status, parent_location_id, new Date().toISOString(), id]);
};

const deleteLocation = (location_id: number) => {
    const query = "DELETE FROM locations WHERE location_id = ?";
    return runQuery(query, [location_id]);
};

// Character functions
const getCharacters = (world_id: number): Character[] => {
    const query = "SELECT * FROM characters WHERE world_id = ?";
    return <Character[]>allQuery(query, [world_id]).map(cleanUpEntity);
};

const getCharacter = (character_id: number): Character => {
    const query = "SELECT * FROM characters WHERE character_id = ?";
    const character = cleanUpEntity(<Character>getQuery(query, [character_id]));
    const relationshipsQuery = `SELECT r.*,
                                       c1.character_id as character_id,
                                       c1.name         as character_name,
                                       c1.icon         as character_icon,
                                       c1.role         as character_role,
                                       c2.character_id as target_id,
                                       c2.name         as target_name,
                                       c2.icon         as target_icon,
                                       c2.role         as target_role
                                FROM relationships r
                                         JOIN characters c1 ON r.character_id = c1.character_id
                                         JOIN characters c2 ON r.target_id = c2.character_id
                                WHERE r.character_id = ? | r.target_id = ?`;
    const relationships: Relationship[] = (<{
        relationship_id: number,
        world_id: number,
        name: string,
        icon: string,
        description: string,
        text: string,
        creation_date: string,
        last_modified: string,
        character_id: number,
        character_name: string,
        character_icon: string,
        character_role: string,
        target_id: number,
        target_name: string,
        target_icon: string,
        target_role: string
    }[]>allQuery(relationshipsQuery, [character_id, character_id])).map(r => {
        return {
            id: r.relationship_id,
            world_id: r.world_id,
            name: r.name,
            icon: r.icon,
            description: r.description,
            text: r.text,
            last_modified: new Date(r.last_modified),
            creation_date: new Date(r.creation_date),
            character: {id: r.character_id, icon: r.character_icon, name: r.character_name, role: r.character_role},
            target: {id: r.target_id, icon: r.target_icon, name: r.target_name, role: r.target_role}
        };
    });

    const eventsQuery = `SELECT e.*,
                                c.character_id as character_id,
                                c.name         as character_name,
                                c.icon         as character_icon,
                                c.role         as character_role,
                                l.location_id  as location_id,
                                l.name         as location_name,
                                l.icon         as location_icon,
                                l.description  as location_description
                         FROM event_characters ec
                                  JOIN events e ON ec.event_id = e.event_id
                                  JOIN characters c ON ec.character_id = c.character_id
                                  JOIN event_locations el ON el.event_id = e.event_id
                                  JOIN locations l ON el.location_id = l.location_id
                         WHERE ec.character_id = ?`;
    const eventResults = (<{
        event_id: number,
        world_id: number,
        name: string,
        icon: string,
        description: string,
        text: string,
        status: string,
        creation_date: string,
        last_modified: string,
        character_id: number,
        character_name: string,
        character_icon: string,
        character_role: string,
        location_id: number,
        location_name: string,
        location_icon: string,
        location_description: string
    }[]>allQuery(eventsQuery, [character_id]));
    const events: Event[] = eventResults.map(e => {
        return {
            id: e.event_id,
            world_id: e.world_id,
            name: e.name,
            icon: e.icon,
            description: e.description,
            text: e.text,
            characters: eventResults.filter(e1 => e1.event_id === e.event_id).map(c => {
                return {id: c.character_id, icon: c.character_icon, name: c.character_name, role: c.character_role};
            }),
            locations: eventResults.filter(e2 => e2.event_id === e.event_id).map(l => {
                return {
                    id: l.location_id,
                    name: l.location_name,
                    icon: l.location_icon,
                    description: l.location_description
                };
            }),
            last_modified: new Date(e.last_modified),
            creation_date: new Date(e.creation_date),
            status: e.status as Status,
            tags: getTagsForEntity("event", e.event_id)
        };
    });
    return {
        ...character,
        relationships,
        events,
    };
};

const insertCharacter = (newCharacter: Omit<Character, "id">) => {
    const {world_id, name, description, icon, text, status, role} = newCharacter;
    const query = `INSERT INTO characters (world_id, name, description, icon, text, status, role)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return runQuery(query, [world_id, name, description, icon, text, status, role]);
};

const updateCharacter = (character: Character) => {
    const {id, name, description, icon, text, status, role} = character;
    const query = `UPDATE characters
                   SET name          = ?,
                       description   = ?,
                       icon          = ?,
                       text          = ?,
                       status        = ?,
                       role          = ?,
                       last_modified = ?
                   WHERE character_id = ?`;
    return runQuery(query, [name, description, icon, text, status, role, new Date().toISOString(), id]);
};

const deleteCharacter = (character_id: number) => {
    const query = "DELETE FROM characters WHERE character_id = ?";
    return runQuery(query, [character_id]);
};

// Chapter functions
const getChapters = (world_id: number): Chapter[] => {
    const query = "SELECT * FROM chapters WHERE world_id = ?";
    return <Chapter[]>allQuery(query, [world_id]).map(cleanUpEntity);
};

const getChapter = (chapter_id: number): Chapter => {
    const query = "SELECT * FROM chapters WHERE chapter_id = ?";
    return cleanUpEntity(<Chapter>getQuery(query, [chapter_id]));
};

const insertChapter = (newChapter: Omit<Chapter, "id">) => {
    const {world_id, story_id, position, name, description, icon, text, status} = newChapter;
    const query = `INSERT INTO chapters (world_id, story_id, position, name, description, icon, text, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    return runQuery(query, [world_id, story_id, position, name, description, icon, text, status]);
};

const updateChapter = (updatedChapter: Chapter) => {
    const {id, position, name, description, icon, text, status} = updatedChapter;
    const query = `UPDATE chapters
                   SET position      = ?,
                       name          = ?,
                       description   = ?,
                       icon          = ?,
                       text          = ?,
                       status        = ?,
                       last_modified = ?
                   WHERE chapter_id = ?`;
    return runQuery(query, [position, name, description, icon, text, status, new Date().toISOString(), id]);
};

const deleteChapter = (chapter_id: number) => {
    const query = "DELETE FROM chapters WHERE chapter_id = ?";
    return runQuery(query, [chapter_id]);
};

const reorderChapters = (world_id: number, chapterOrder: number[]) => {
    const query = "UPDATE chapters SET position = ? WHERE chapter_id = ? AND world_id = ?";
    const stmt = db.prepare(query);
    db.transaction(() => {
        chapterOrder.forEach((chapter_id, index) => {
            stmt.run(index + 1, chapter_id, world_id);
        });
    })();
};

// Scene functions
const getScenes = (world_id: number): Scene[] => {
    const query = "SELECT * FROM scenes WHERE world_id = ?";
    return <Scene[]>allQuery(query, [world_id]).map(cleanUpEntity);
};

const getScene = (scene_id: number): Scene => {
    const query = "SELECT * FROM scenes WHERE scene_id = ?";
    return cleanUpEntity(<Scene>getQuery(query, [scene_id]));
};

const insertScene = (newScene: Omit<Scene, "id">) => {
    const {world_id, chapter_id, position, name, description, icon, text, status} = newScene;
    const query = `INSERT INTO scenes (world_id, chapter_id, position, name, description, icon, text, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    return runQuery(query, [world_id, chapter_id, position, name, description, icon, text, status]);
};

const updateScene = (updatedScene: Scene) => {
    const {id, position, name, description, icon, text, status} = updatedScene;
    const query = `UPDATE scenes
                   SET position      = ?,
                       name          = ?,
                       description   = ?,
                       icon          = ?,
                       text          = ?,
                       status        = ?,
                       last_modified = ?
                   WHERE scene_id = ?`;
    return runQuery(query, [position, name, description, icon, text, status, new Date().toISOString(), id]);
};

const deleteScene = (scene_id: number) => {
    const query = "DELETE FROM scenes WHERE scene_id = ?";
    return runQuery(query, [scene_id]);
};

const reorderScenes = (chapter_id: number, sceneOrder: number[]) => {
    const query = "UPDATE scenes SET position = ? WHERE scene_id = ? AND chapter_id = ?";
    const stmt = db.prepare(query);
    db.transaction(() => {
        sceneOrder.forEach((scene_id, index) => {
            stmt.run(index + 1, scene_id, chapter_id);
        });
    })();
};

// Event functions
const getEvents = (world_id: number): Event[] => {
    const query = "SELECT * FROM events WHERE world_id = ?";
    return <Event[]>allQuery(query, [world_id]).map(cleanUpEntity);
};

const getEvent = (event_id: number): Event => {
    const query = "SELECT * FROM events WHERE event_id = ?";
    return cleanUpEntity(<Event>getQuery(query, [event_id]));
};

const insertEvent = (newEvent: Omit<Event, "id">) => {
    const {world_id, name, description, icon, text, status} = newEvent;
    const query = `INSERT INTO events (world_id, name, description, icon, text, status)
                   VALUES (?, ?, ?, ?, ?, ?)`;
    return runQuery(query, [world_id, name, description, icon, text, status]);
};

const updateEvent = (updatedEvent: Event) => {
    const {id, name, description, icon, text, status} = updatedEvent;
    const query = `UPDATE events
                   SET name          = ?,
                       description   = ?,
                       icon          = ?,
                       text          = ?,
                       status        = ?,
                       last_modified = ?
                   WHERE event_id = ?`;
    return runQuery(query, [name, description, icon, text, status, new Date().toISOString(), id]);
};

const deleteEvent = (event_id: number) => {
    const query = "DELETE FROM events WHERE event_id = ?";
    return runQuery(query, [event_id]);
};

// Tag functions
const getTags = (): Tag[] => {
    const query = "SELECT * FROM tags";
    return (<(Tag & { tag_id: number })[]>allQuery(query)).map(tag => {
        return {...tag, id: tag.tag_id};
    });
};

const getTag = (tag_id: number): Tag => {
    const query = "SELECT * FROM tags WHERE tag_id = ?";
    const result = <(Tag & { tag_id: number })>getQuery(query, [tag_id]);
    return {...result, id: result.tag_id};
};

const insertTag = (name: string, icon: string) => {
    const query = `INSERT INTO tags (name, icon)
                   VALUES (?, ?)`;
    return runQuery(query, [name, icon]);
};

const updateTag = (tag_id: number, name: string, icon: string) => {
    const query = `UPDATE tags
                   SET name = ?,
                       icon = ?
                   WHERE tag_id = ?`;
    return runQuery(query, [name, icon, tag_id]);
};

const deleteTag = (tag_id: number) => {
    const query = "DELETE FROM tags WHERE tag_id = ?";
    return runQuery(query, [tag_id]);
};

// Relationships
const getTagsForEntity = (entityType: string, entityId: number) => {
    const tableMap: { [index: string]: string } = {
        "world": "world_tags",
        "character": "character_tags",
        "event": "event_tags",
        "location": "location_tags",
        "scene": "scene_tags",
        "story": "story_tags",
        "chapter": "chapter_tags"
    };

    const tableName = tableMap[entityType];
    if (!tableName) {
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    const entityColumn = entityType + "_id";

    const query = `SELECT t.tag_id as id, t.name, t.icon
                   FROM ${tableName} tr
                            JOIN tags t on t.tag_id = tr.tag_id
                   WHERE (${entityColumn} = ?`;
    return <Tag[]>allQuery(query, [entityId]);
};
const addTagToEntity = (entityType: string, entityId: number, tagId: number) => {
    const tableMap: { [index: string]: string } = {
        "world": "world_tags",
        "character": "character_tags",
        "event": "event_tags",
        "location": "location_tags",
        "scene": "scene_tags",
        "story": "story_tags",
        "chapter": "chapter_tags"
    };

    const tableName = tableMap[entityType];
    if (!tableName) {
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    const entityColumn = entityType + "_id";

    const query = `INSERT INTO ${tableName} (${entityColumn}, tag_id)
                   VALUES (?, ?)`;
    return runQuery(query, [entityId, tagId]);
};

const removeTagFromEntity = (entityType: string, entityId: number, tagId: number) => {
    const tableMap: { [index: string]: string } = {
        "world": "world_tags",
        "character": "character_tags",
        "event": "event_tags",
        "location": "location_tags",
        "scene": "scene_tags",
        "story": "story_tags",
        "chapter": "chapter_tags"
    };

    const tableName = tableMap[entityType];
    if (!tableName) {
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    const entityColumn = entityType + "_id";

    const query = `DELETE
                   FROM ${tableName}
                   WHERE ${entityColumn} = ?
                     AND tag_id = ?`;
    return runQuery(query, [entityId, tagId]);
};

export const dbFunctions = {
    worlds: {createWorld, getWorlds, getWorld},
    locations: {getLocations, getLocation, insertLocation, updateLocation, deleteLocation},
    characters: {getCharacters, getCharacter, insertCharacter, updateCharacter, deleteCharacter},
    chapters: {getChapters, getChapter, insertChapter, updateChapter, deleteChapter, reorderChapters},
    scenes: {getScenes, getScene, insertScene, updateScene, deleteScene, reorderScenes},
    events: {getEvents, getEvent, insertEvent, updateEvent, deleteEvent},
    tags: {getTags, getTag, insertTag, updateTag, deleteTag, addTagToEntity, removeTagFromEntity}
};