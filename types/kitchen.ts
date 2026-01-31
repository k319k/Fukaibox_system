export interface Section {
    id: string;
    projectId: string;
    orderIndex: number | null;
    content: string | null;
    imageInstruction: string | null;
    referenceImageUrl: string | null;
    isGenerating: boolean | null;
    allowImageSubmission: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface Project {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Proposal {
    id: string;
    sectionId: string;
    proposedBy: string;
    proposedContent: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
}

export interface UploadedImage {
    id: string;
    projectId: string;
    sectionId: string | null;
    uploadedBy: string;
    imageUrl: string;
    isSelected: boolean | null;
    comment: string | null;
    createdAt: Date;
}

export type UserRole = "gicho" | "meiyo_giin" | "giin" | "guest" | "anonymous";

export interface KitchenDetailClientProps {
    project: Project;
    initialSections: Section[];
    userRole?: UserRole;
    currentUser?: {
        id: string;
        name: string;
        image: string | null;
    } | null;
}
