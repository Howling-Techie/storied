export type BaseEntity = {
    project_id: number,
    id: number,
    name: string,
    description: string,
    icon: string | null,
    text: string | null,
    filename: string,
    status: Status,
    creation_date: Date,
    last_modified: Date,
    tags: Tag[];
}

export type Tag = {
    id: number,
    icon: string,
    name: string,
}

export type Status = "concept" | "outlined" | "writing" | "editing" | "finished";
export type EntityType = "Location" | "Character" | "Story" | "Chapter" | "Scene" | "Event";

export type Project = Omit<BaseEntity, "project_id">

export type Location = {
    parent_location_id: number | null
} & BaseEntity

export type Character = {
    role: string,
    traits: { icon: string, trait: string }[],
    relationships: { character_id: number, type: string }[]
} & BaseEntity

export type Story = {
    project_id: number,
} & BaseEntity

export type Chapter = {
    story_id: number,
    position: number,
} & BaseEntity

export type Scene = {
    chapter_id: number,
    position: number,
    status: Status,
    locations: Location[],
    characters: Character[],
} & BaseEntity

export type Event = {
    previous_event_ids: number[],
    next_event_ids: number[],
    locations: Location[],
    characters: Character[],
} & BaseEntity