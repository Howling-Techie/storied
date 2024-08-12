import React, {useEffect, useState} from "react";
import {
    AdmonitionDirectiveDescriptor, BlockTypeSelect,
    BoldItalicUnderlineToggles, ChangeAdmonitionType,
    CodeToggle,
    ConditionalContents,
    diffSourcePlugin,
    DiffSourceToggleWrapper, DirectiveNode,
    directivesPlugin, EditorInFocus,
    headingsPlugin, InsertAdmonition, InsertCodeBlock, InsertTable, InsertThematicBreak,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    Separator,
    StrikeThroughSupSubToggles,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import "../editor.css";

type AdmonitionKind = "note" | "tip" | "danger" | "info" | "caution";

function whenInAdmonition(editorInFocus: EditorInFocus | null) {
    const node = editorInFocus?.rootNode;
    if (!node || node.getType() !== "directive") {
        return false;
    }

    return ["note", "tip", "danger", "info", "caution"].includes((node as DirectiveNode).getMdastNode().name as AdmonitionKind);
}

type structureNode = {
    level: number,
    title: string,
    children: structureNode[];
};

type htmlStructureNode = {
    element: Element,
    level: number,
    children: htmlStructureNode[];
}

const Editor = ({initialMarkdown, onChange}: { initialMarkdown: string, onChange: () => void }) => {
    const ref = React.useRef<MDXEditorMethods>(null);
    const [structure, setStructure] = useState<structureNode[]>([]);
    const [markdown, setMarkdown] = useState(initialMarkdown);

    const handleEditorChange = () => {
        const newMarkdown = ref.current?.getMarkdown();
        if (newMarkdown) {
            setMarkdown(newMarkdown);
        }
        onChange();
    };

    useEffect(() => {
        const lines = markdown.split("\n");
        console.log(lines.length);
        if (lines.length === 0)
            return;
        const root: structureNode = {level: 0, title: "", children: []};
        const stack: structureNode[] = [root];
        for (const line of lines) {
            const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
            if (match) {
                const level = match[1].length;
                const title = match[2];
                const newNode: structureNode = {
                    level,
                    title,
                    children: []
                };

                while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }

                stack[stack.length - 1].children.push(newNode);
                stack.push(newNode);
            }
        }
        setStructure(root.children);
    }, [markdown]);

    const handleHeadingSelect = (path: number[]) => {
        const editor = document.getElementById("editor");
        const toolbar = document.querySelector("[role=toolbar]");
        if (!editor) {
            console.error("Editor element not found");
            return;
        }

        // Get all headings from the editor
        const headingElements = Array.from(editor.querySelectorAll("h1, h2, h3, h4, h5, h6"));
        // Convert array to a tree structure
        const root: htmlStructureNode = {element: editor, level: 0, children: []};
        const stack: htmlStructureNode[] = [root];
        for (const heading of headingElements) {
            const level = Number.parseInt(heading.nodeName.slice(1, 2));
            const newNode: htmlStructureNode = {element: heading, children: [], level};

            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            stack[stack.length - 1].children.push(newNode);
            stack.push(newNode);
        }

        // Get relevant element
        let elementResult = root;
        while (path.length > 0) {
            elementResult = elementResult.children[path.shift()];
        }
        console.log(`Scrolling to ${elementResult.element.innerHTML}: ${elementResult.element.getBoundingClientRect().y}`);
        // Scroll the window to the matched heading element, with an offset to try and account for the toolbar
        const y = elementResult.element.getBoundingClientRect().y - toolbar.getBoundingClientRect().height + editor.scrollTop;
        //heading.scrollIntoView({behavior: "smooth", block: "start"});
        editor.scrollTo({top: y, behavior: "smooth"});
        return;
    };

    return (
        <div className="w-full flex flex-row">
            <div className="w-1/4 border-l">
                <Outline nodes={structure} onSelect={handleHeadingSelect}/>
            </div>
            <div className="w-3/4 border-l">
                <div className="no-twp h-[calc(100vh-56px)] overflow-y-scroll lg:h-screen" id="editor">
                    <MDXEditor className="editor" markdown={markdown} ref={ref}
                               onChange={() => handleEditorChange()}
                               plugins={[
                                   headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin(), directivesPlugin({directiveDescriptors: [AdmonitionDirectiveDescriptor]}), tablePlugin(), diffSourcePlugin({
                                       viewMode: "rich-text"
                                   }), toolbarPlugin({
                                       toolbarContents: () => (
                                           <>
                                               <DiffSourceToggleWrapper options={["rich-text", "source"]}>
                                                   <div className="twp flex flex-wrap space-x-2 flex-row">
                                                       <UndoRedo/>
                                                       <Separator/>
                                                       <section className="flex flex-row">
                                                           <BoldItalicUnderlineToggles/>
                                                           <CodeToggle/>
                                                           <Separator/>
                                                       </section>
                                                       <section className="flex flex-row">
                                                           <StrikeThroughSupSubToggles/>
                                                           <Separator/>
                                                       </section>
                                                       <section className="flex flex-row">
                                                           <ListsToggle/>
                                                           <Separator/>
                                                       </section>
                                                       <section className="flex flex-row">
                                                           <ConditionalContents
                                                               options={[{
                                                                   when: whenInAdmonition,
                                                                   contents: () => <ChangeAdmonitionType/>
                                                               }, {fallback: () => <BlockTypeSelect/>}]}
                                                           />
                                                           <Separator/>
                                                       </section>
                                                       <section className="flex flex-row">
                                                           <InsertTable/>
                                                           <InsertThematicBreak/>
                                                           <Separator/>
                                                       </section>
                                                       <section className="flex flex-row">
                                                           <InsertCodeBlock/>
                                                           <InsertAdmonition/>
                                                       </section>
                                                   </div>
                                               </DiffSourceToggleWrapper>
                                           </>
                                       )
                                   })]}/>
                </div>
            </div>
        </div>
    );
};

type OutlineProps = {
    nodes: structureNode[];
    onSelect: (path: number[]) => void;
};

const Outline = ({nodes, onSelect}: OutlineProps) => {
    const renderNodes = (nodes: structureNode[], path: number[] = []) => {
        return (
            <ul className="ml-4" id="outline">
                {nodes.map((node, index) => {
                    const currentPath = [...path, index];
                    return (
                        <li key={currentPath.join("-")}>
                            <button
                                className="text-left p-1 hover:bg-gray-200 w-full"
                                onClick={() => onSelect([...currentPath])}
                            >
                                {node.title}
                            </button>
                            {node.children.length > 0 && renderNodes(node.children, currentPath)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return <div>{renderNodes(nodes)}</div>;
};

export default Editor;