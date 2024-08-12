export type Project = {
    id: number,
    name: string,
    description: string,
    icon: string,
    creation_date: Date,
    last_modified: Date,
    tags: string[]
}

export type Location = {
    id: number,
    project_id: number,
    name: string,
    description: string,
    filename: string,
    text: string | null,
    icon: string
}

export type Character = {
    id: number,
    project_id: number,
    name: string,
    filename: string,
    role: string,
    description: string,
    text: string,
    icon: string,
    traits: { icon: string, trait: string }[],
    relationships: { character: Character, type: string }[]
}

export type Chapter = {
    id: number,
    project_id: number,
    name: string,
    filename: string,
    position: number,
    description: string,
    text: string
}

export type Scene = {
    id: number,
    project_id: number,
    chapter_id: number,
    name: string,
    filename: string,
    position: number,
    description: string,
    text: string,
    status: "concept" | "outlined" | "writing" | "editing" | "finished",
    locations: Location[],
    characters: Character[],
}