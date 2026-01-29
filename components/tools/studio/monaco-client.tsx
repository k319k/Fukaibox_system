"use strict";
import React, { useEffect } from "react";
import { useActiveCode } from "@codesandbox/sandpack-react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface MonacoEditorClientProps {
    readOnly?: boolean;
}

export function MonacoEditorClient({ readOnly = false }: MonacoEditorClientProps) {
    const { code, updateCode } = useActiveCode();
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            // M3 Dark Theme Definition
            monaco.editor.defineTheme("m3-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.background": "#49454F", // Surface Variant (M3)
                    "editor.foreground": "#EADDFF", // On Surface Variant / Primary Lighter
                    "editor.lineHighlightBackground": "#49454F",
                    "editorCursor.foreground": "#D0BCFF",
                    "editorIndentGuide.background": "#49454F",
                    "editorIndentGuide.activeBackground": "#CAC4D0",
                }
            });
            monaco.editor.setTheme("m3-dark");
        }
    }, [monaco]);

    return (
        <div style={{
            height: "100%",
            borderRadius: "28px", // M3 Extra Large Container
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            background: "#49454F", // Match editor bg
            paddingTop: "16px",
            paddingBottom: "16px"
        }}>
            <Editor
                height="100%"
                language="typescript" // Should ideally be dynamic based on active file
                theme="m3-dark"
                value={code}
                onChange={(value) => updateCode(value || "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    padding: { top: 8, bottom: 8 },
                    scrollBeyondLastLine: false,
                    readOnly: readOnly,
                    roundedSelection: true,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
