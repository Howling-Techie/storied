export type BaseEntity = {
    world_id: number,
    id: number,
    name: string,
    description: string | null,
    icon: string | null,
    text: string | null,
    //filename: string,
    status: Status | null,
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

export type World = Omit<BaseEntity, "world_id">

export type Location = {
    parent_location_id: number | null
} & BaseEntity

export type Character = {
    role: string | null,
    traits: { icon: string, trait: string }[],
    relationships: Relationship[],
    events: Event[]
} & BaseEntity

export type Story = BaseEntity

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
    // previous_event_ids: number[],
    // next_event_ids: number[],
    locations: { id: number, name: string, icon: string, description: string }[],
    characters: { id: number, name: string, icon: string, role: string }[],
} & BaseEntity

export type Relationship = {
    character: { id: number, name: string, icon: string, role: string },
    target: { id: number, name: string, icon: string, role: string }
} & Omit<BaseEntity, "tags" | "status">

export type EntityType = "Location" | "Character" | "Story" | "Chapter" | "Scene" | "Event";