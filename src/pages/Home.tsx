import React, {useEffect, useState} from "react";
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles, Button,
    ChangeAdmonitionType,
    CodeToggle,
    ConditionalContents,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    DirectiveNode,
    EditorInFocus, GenericJsxEditor,
    InsertAdmonition,
    InsertCodeBlock, insertJsx$,
    InsertTable,
    InsertThematicBreak, JsxComponentDescriptor, jsxPlugin,
    ListsToggle,
    MDXEditor, NestedLexicalEditor,
    Separator,
    StrikeThroughSupSubToggles,
    UndoRedo, usePublisher
} from "@mdxeditor/editor";
import {MdxJsxFlowElement} from "mdast-util-mdx-jsx";
import {
    AdmonitionDirectiveDescriptor,
    markdownShortcutPlugin,
    directivesPlugin,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    type MDXEditorMethods,
    type MDXEditorProps
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

// const jsxComponentDescriptors: JsxComponentDescriptor[] = [
//     {
//         name: "ComponentTest",
//         kind: "flow", // 'text' for inline, 'flow' for block
//         // the source field is used to construct the import statement at the top of the markdown document.
//         // it won't be actually sourced.
//         source: "./external",
//         // Used to construct the property popover of the generic editor
//         props: [],
//         // whether the component has children or not
//         hasChildren: true,
//         Editor: () => {
//             return (
//                 <div onClick={() => console.log("Click!")}>
//                     <NestedLexicalEditor<MdxJsxFlowElement>
//                         getContent={(node) => node.children}
//                         getUpdatedMdastNode={(mdastNode, children: any) => {
//                             return {...mdastNode, children};
//                         }}
//                     />
//                 </div>
//             );
//         }
//     },
// ];
//
// // a toolbar button that will insert a JSX element into the editor.
// const InsertScene = () => {
//     const insertJsx = usePublisher(insertJsx$);
//     return (
//         <Button
//             onClick={() =>
//                 insertJsx({
//                     name: "ComponentTest",
//                     kind: "flow",
//                     props: {}
//                 })
//             }
//         >
//             Add Test
//         </Button>
//     );
// };


const initialMarkdown = `
# Welcome

This is a **live demo** of MDXEditor with all default features on.

> The overriding design goal for Markdown’s formatting syntax is to make it as readable as possible.
> The idea is that a Markdown-formatted document should be publishable as-is, as plain text,
> without looking like it’s been marked up with tags or formatting instructions.

In here, you can find the following markdown elements:

* Headings
* Lists
  * Unordered
  * Ordered
  * Check lists
  * And nested ;)
* Links
* Bold/Italic/Underline formatting
* Tables
* Code block editors
* And much more.


## What can you do here?

This is a great location for you to test how editing markdown feels. If you have an existing markdown source, you can switch to source mode using the toggle group in the top right, paste it in there, and go back to rich text mode.

If you need a few ideas, here's what you can try:

1. Add your own code sample
2. Change the type of the headings
3. Insert a table, add a few rows and columns
4. Switch back to source markdown to see what you're going to get as an output
5. Test the diff feature to see how the markdown has changed
6. Add a frontmatter block through the toolbar button

## A table

Play with the table below - add rows, columns, change column alignment. When editing,
you can navigate the cells with \`enter\`, \`shift+enter\`, \`tab\` and \`shift+tab\`.

| Item              | In Stock | Price |
| :---------------- | :------: | ----: |
| Python Hat        |   True   | 23.99 |
| SQL Hat           |   True   | 23.99 |
| Codecademy Tee    |   False  | 19.99 |
| Codecademy Hoodie |   False  | 42.99 |
`;

const Home = () => {
    const ref = React.useRef<MDXEditorMethods>(null);
    const [structure, setStructure] = useState<structureNode[]>([]);
    const [markdown, setMarkdown] = useState(initialMarkdown);

    const handleEditorChange = () => {
        const newMarkdown = ref.current?.getMarkdown();
        if (newMarkdown) {
            setMarkdown(newMarkdown);
            // const editor = document.getElementById("editor");
            // console.log();
        }
    };

    useEffect(() => {
        const lines = markdown.split("\n");
        const root: structureNode = {level: 0, title: "", children: []};
        const stack: structureNode[] = [root];

        for (const line of lines) {
            const match = /^(#{1,6})\s+(.*)$/.exec(line);
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
        console.log(path);
        console.log(root);
        while (path.length > 0) {
            elementResult = elementResult.children[path.shift()];
        }

        // Scroll the window to the matched heading element, with an offset to try and account for the toolbar
        const y = elementResult.element.getBoundingClientRect().y - toolbar.getBoundingClientRect().height + editor.scrollTop;
        //heading.scrollIntoView({behavior: "smooth", block: "start"});
        editor.scrollTo({top: y, behavior: "smooth"});
        return;
    };

    return (
        <div className="w-full flex flex-row max-h-full">
            <div className="w-1/4">
                <Outline nodes={structure} onSelect={handleHeadingSelect}/>
            </div>
            <div className="w-3/4 overflow-y-scroll overflow-x-hidden" id="editor">
                <div className="no-twp">
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
            <ul className="ml-4">
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

export default Home;