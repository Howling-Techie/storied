import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Chapter, Scene} from "../utils/types";
import Editor from "../components/Editor";
import {createRoot} from "react-dom/client";

const replaceElement = (searchString: string, replacementComponent: React.ReactElement): void => {
    const editorElement = document.getElementById("outline");

    if (!editorElement) {
        console.error("Element with ID \"editor\" not found.");
        return;
    }

    const elements = editorElement.getElementsByTagName("*");
    let foundElement: HTMLElement | null = null;

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].textContent === searchString) {
            foundElement = elements[i] as HTMLElement;
            break;
        }
    }

    if (foundElement) {
        console.log(`Found element! ${foundElement.textContent}`);
        const root = createRoot(foundElement);
        root.render(replacementComponent);
    } else {
        console.error(`Element with inner text "${searchString}" not found.`);
    }
};

const SceneNode = ({title, summary}: { title: string, summary: string }) => {
    return (
        <div>
            {title}: {summary}
        </div>
    );
};

const handleMarkdownChange = () => {
    // replaceElement("Scene 1: Discovery in the Temple", <SceneNode title={"Discovery in the Temple"}
    //                                                               summary={"A Group of explorers find a thing"}/>);
};

const Chapter = () => {
    const {project_id, chapter_id} = useParams();
    const [chapter, setChapter] = useState<Chapter>();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);

    useEffect(() => {
        const getChapterData = async () => {
            const chapterID = Number.parseInt(chapter_id);
            const projectID = Number.parseInt(project_id);
            const chapterData = await window.electronAPI.getChapter(projectID, chapterID);
            const chaptersData = await window.electronAPI.getChapters(projectID);
            const sceneData = await window.electronAPI.getScenes(projectID);
            setChapter(chapterData);
            const fullSceneData = (sceneData.filter(scene => scene.chapter_id === chapterID).map(s => window.electronAPI.getScene(s.project_id, s.chapter_id, s.id)));
            setScenes(await Promise.all(fullSceneData));
            setChapters(chaptersData);
        };
        if (project_id && chapter_id)
            getChapterData();
    }, [project_id, chapter_id]);

    if (!chapter) {
        return (<div>Loading Chapter...</div>);
    }
    return (
        <div className="overflow-y-clip h-[calc(100vh-56px)] overflow-clip lg:h-screen">
            <div className="flex flex-row overflow-y-clip h-full">
                <div className="w-1/4 p-4 pl-8">
                    <h1 className="text-3xl font-semibold pb-2">{chapter.name}</h1>
                    <p className="text-lg pb-2">{chapter.description}</p>
                    <h2 className="text-xl font-semibold">Scenes</h2>
                    {scenes.filter(scene => scene.chapter_id === chapter.id).sort((sA, sB) => sA.position - sB.position).map(scene => (
                        <div key={scene.id} className="border rounded p-4 mb-4">
                            <div className="flex flex-row content-center space-x-2"><h4
                                className="text-lg font-semibold">{scene.position}. {scene.name}
                            </h4><SceneStatus
                                status={scene.status}/></div>
                            <p>{scene.description}</p>
                            <p className="font-sm text-gray-700 border p-2 rounded">{scene.text}</p>
                        </div>
                    ))}
                </div>
                <div className="w-3/4 h-full">
                    <Editor initialMarkdown={chapter.text} onChange={handleMarkdownChange}/>
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

export default Chapter;