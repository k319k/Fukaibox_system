"use client";

import { Sandpack, SandpackFiles } from "@codesandbox/sandpack-react";
import { FUKAI_SDK_SOURCE } from "@/lib/tools/sdk-source";

interface SandpackClientProps {
    files?: SandpackFiles;
    template?: "react-ts" | "react" | "vanilla-ts" | "vanilla";
    readOnly?: boolean;
}

/**
 * Sandpack Client for Tools Studio.
 * Wraps @codesandbox/sandpack-react with Fukai SDK injection.
 */
export function SandpackClient({ files = {}, template = "react-ts", readOnly = false }: SandpackClientProps) {

    // Inject SDK source into the environment
    const sdkInjectionScript = `
<script>
  window.FUKAI_SDK_Config = {
    // Optional config
  };
  ${FUKAI_SDK_SOURCE}
</script>
`;

    const defaultIndexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fukai App</title>
  </head>
  <body>
    <div id="root"></div>
    ${sdkInjectionScript}
  </body>
</html>`;

    // Ensure we have the essential files for the template if not provided
    const finalFiles: SandpackFiles = {
        ...files,
        "/public/index.html": {
            code: defaultIndexHtml,
            hidden: true,
        },
    };

    return (
        <div className="h-full w-full">
            <Sandpack
                template={template}
                files={finalFiles}
                options={{
                    showNavigator: false,
                    showTabs: !readOnly, // Hide tabs if read-only (focus on preview)
                    showConsoleButton: true,
                    editorHeight: "100%",
                    showLineNumbers: true,
                    wrapContent: true,
                    readOnly: readOnly,
                    externalResources: [
                        "https://cdn.tailwindcss.com"
                    ]
                }}
                customSetup={{
                    dependencies: {
                        "lucide-react": "^0.263.1",
                        "clsx": "^2.0.0",
                        "tailwind-merge": "^1.14.0"
                    }
                }}
                theme="dark"
            />
        </div>
    );
}
