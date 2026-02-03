// Tools App Types

export type SaveToolsAppData = {
    title: string;
    description?: string;
    category?: string;
    files: Record<string, string>; // filename -> content
    type?: "react-ts" | "react" | "vanilla-ts" | "vanilla" | "embed" | "link" | "html";
    embedUrl?: string | null;
    isPublic?: boolean;
};

export type ToolApp = {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    type: "embed" | "link" | "react" | "html";
    embedUrl: string | null;
    isPublic: boolean | null;
    viewCount: number | null;
    playCount: number | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    creatorName?: string | null;
    creatorImage?: string | null;
    files?: Record<string, string>;
};
