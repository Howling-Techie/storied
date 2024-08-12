import React, {useEffect, useState} from "react";
import {Project} from "../utils/types";
import {Link} from "react-router-dom";

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const getProjects = async () => {
            const data = await window.electronAPI.getProjects();
            setProjects(data);
        };
        getProjects();
    }, []);

    return (
        <div className="py-4 px-8 overflow-y-scroll h-full">
            <h1 className="text-3xl font-semibold pb-2">Projects</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {projects.map(p => (<ProjectPreview project={p} key={p.id}/>))}
                <div
                    className="rounded-2xl border-dashed border-sky-400 border-2 border-opacity-50 p-3 flex justify-center items-center text-xl">
                    Create New Project
                </div>
            </div>
        </div>
    );
};

const ProjectPreview = ({project}: { project: Project }) => {
    return (
        <Link to={project.id.toString()} className="rounded-2xl shadow-xl border border-gray-400 border-opacity-50 p-3">
            <h2 className="text-xl font-semibold">{project.icon} {project.name}</h2>
            <div>{project.description}</div>
            <div className="flex flex-row space-x-2 py-2">{project.tags.map(tag => <div
                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                key={tag}>{tag}</div>)}</div>
            <div className="text-sm text-gray-600">Created on: {project.creation_date.toDateString()}</div>
        </Link>
    );
};

export default Projects;



