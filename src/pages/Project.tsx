import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {Chapter, Character, Project, Scene, Location} from "../utils/types";

const Project = () => {
    const {project_id} = useParams();
    const [project, setProject] = useState<Project>();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        const getProject = async () => {
            const projectId = Number.parseInt(project_id);
            const projectData = await window.electronAPI.getProject(projectId);
            setProject(projectData);
            const chapterData = await window.electronAPI.getChapters(projectId);
            setChapters(chapterData);
            const sceneData = await window.electronAPI.getScenes(projectId);
            setScenes(sceneData);
            const characterData = await window.electronAPI.getCharacters(projectId);
            setCharacters(characterData);
            const locationData = await window.electronAPI.getLocations(projectId);
            setLocations(locationData);
        };
        getProject();
    }, []);

    if (!project) {
        return <div className="font-semibold text-xl">Loading Project...</div>;
    }

    return (
        <div className="py-4 px-8 overflow-y-scroll h-full">
            <h1 className="text-3xl font-semibold pb-2">{project.icon} {project.name}</h1>
            <p className="text-lg pb-2">{project.description}</p>
            <div className="text-sm text-gray-600 pb-4">
                Created on: {project.creation_date.toLocaleDateString()}
            </div>
            <div className="pb-4">
                <h2 className="text-2xl font-semibold pb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => <span
                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                        key={tag}>{tag}</span>)}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="border rounded px-4 py-2">
                    <h2 className="text-2xl font-semibold pb-2">Chapters</h2>
                    {chapters.sort((cA, cB) => cA.position - cB.position).map(chapter => (
                        <Link to={`chapters/${chapter.id}`} key={chapter.id}>
                            <div className="border rounded p-4 mb-4">
                                <h3 className="text-xl font-semibold">{chapter.position}. {chapter.name}</h3>
                                <p>{chapter.description}</p>
                                <h3 className="text-xl font-semibold py-2">Scenes</h3>
                                {scenes.filter(scene => scene.chapter_id === chapter.id).sort((sA, sB) => sA.position - sB.position).map(scene => (
                                    <div key={scene.id} className="border rounded p-4 mb-4">
                                        <div className="flex flex-row content-center space-x-2"><h4
                                            className="text-lg font-semibold">{scene.position}. {scene.name}
                                        </h4><SceneStatus
                                            status={scene.status}/></div>
                                        <p>{scene.description}</p>
                                    </div>
                                ))}
                                <div
                                    className="rounded border-dashed border-sky-400 border-2 border-opacity-50 p-3 flex justify-center items-center text-lg font-semibold">
                                    Add Scene
                                </div>
                            </div>
                        </Link>
                    ))}
                    <div
                        className="rounded border-dashed border-sky-400 border-2 border-opacity-50 p-3 flex justify-center items-center text-xl font-semibold">
                        Add Chapter
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="border rounded px-4 py-2">
                        <h2 className="text-2xl font-semibold pb-2">Characters</h2>
                        <div className="grid grid-cols-1 gap-2">
                            {characters.map(character => (
                                <div key={character.id} className="border rounded p-4 flex items-center">
                                    <div className="mr-4">
                                        <span className="text-3xl">{character.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{character.name}</h3>
                                        <p>{character.description}</p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {character.traits.map((trait, index) => (
                                                <span key={index}
                                                      className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-sm text-green-700">
                                        {trait.icon} {trait.trait}
                                    </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div
                                className="rounded border-dashed border-sky-400 border-2 border-opacity-50 p-8 flex justify-center items-center text-xl font-semibold">
                                Add Character
                            </div>
                        </div>
                    </div>
                    <div className="border rounded px-4 py-2">
                        <h2 className="text-2xl font-semibold pb-2">Locations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {locations.map(location => (
                                <div key={location.id} className="border rounded p-4 flex">
                                    <div className="mr-4 flex items-center">
                                        <span className="text-3xl">{location.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{location.name}</h3>
                                        <p>{location.description}</p>
                                    </div>
                                </div>
                            ))}
                            <div
                                className="rounded border-dashed border-sky-400 border-2 border-opacity-50 p-8 flex justify-center items-center text-xl font-semibold">
                                Add Location
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SceneStatus = ({status}: { status: string }) => {
    switch (status) {
        case "concept":
            return <span
                className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-gray-400">
          <circle r={3} cx={3} cy={3}/>
        </svg>
        Concept
      </span>;
        case "outlined":
            return <span
                className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-yellow-500">
          <circle r={3} cx={3} cy={3}/>
        </svg>
        Outlined
      </span>;
        case "writing":
            return <span
                className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-green-500">
          <circle r={3} cx={3} cy={3}/>
        </svg>
        Writing
      </span>;
        case "editing":
            return <span
                className="inline-flex items-center gap-x-1.5 rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
        <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-purple-500">
          <circle r={3} cx={3} cy={3}/>
        </svg>
        Editing
      </span>;
        case "finished":
            return <span
                className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
        <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-blue-500">
          <circle r={3} cx={3} cy={3}/>
        </svg>
        Finished
      </span>;
        default:
            return <span
                className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-gray-400">
          <circle r={3} cx={3} cy={3}/>
        </svg>
                {status}
      </span>;
    }
};

export default Project;