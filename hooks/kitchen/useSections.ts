"use client";

import { useState } from "react";
import { Section } from "@/types/kitchen";
import {
    createCookingSection,
    deleteCookingSection,
    updateCookingSection,
    setProjectScript,
    getCookingSections
} from "@/app/actions/kitchen";

export function useSections(
    projectId: string,
    sections: Section[],
    setSections: React.Dispatch<React.SetStateAction<Section[]>>
) {
    // --- Script & Creation ---
    const [fullScript, setFullScript] = useState("");
    const [isCreatingSections, setIsCreatingSections] = useState(false);

    // --- Inline Editing ---
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editImageInstruction, setEditImageInstruction] = useState("");
    const [editReferenceImageUrl, setEditReferenceImageUrl] = useState("");
    const [editAllowSubmission, setEditAllowSubmission] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- Handlers ---

    const handleCreateSections = async () => {
        if (!fullScript.trim()) return;
        setIsCreatingSections(true);
        try {
            await setProjectScript(projectId, fullScript);

            // 少し待ってからリロード（非同期処理の完了待ち）
            // 実際にはsetProjectScriptがセクション作成まで完了して戻れば良いが、
            // 現状の実装に合わせて再取得
            const newSections = await getCookingSections(projectId);
            setSections(newSections);
            setFullScript("");
        } catch (error) {
            console.error("Failed to create sections:", error);
            alert("セクションの作成に失敗しました。");
        } finally {
            setIsCreatingSections(false);
        }
    };

    const handleAddSection = async (insertIndex: number) => {
        if (!confirm("新しいセクションを追加しますか？")) return;
        try {
            await createCookingSection(projectId, insertIndex, "");
            const newSections = await getCookingSections(projectId);
            setSections(newSections);
        } catch (error) {
            console.error("Failed to add section:", error);
            alert("セクションの追加に失敗しました。");
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm("本当にこのセクションを削除しますか？")) return;
        try {
            await deleteCookingSection(sectionId, projectId);
            const newSections = await getCookingSections(projectId);
            setSections(newSections);
        } catch (error) {
            console.error("Failed to delete section:", error);
            alert("セクションの削除に失敗しました。");
        }
    };

    const handleEditStart = (section: Section) => {
        setEditingSection(section);
        setEditContent(section.content || "");
        setEditImageInstruction(section.imageInstruction || "");
        setEditReferenceImageUrl(section.referenceImageUrl || "");
        setEditAllowSubmission(section.allowImageSubmission ?? true);
    };

    const handleEditCancel = () => {
        setEditingSection(null);
        setEditContent("");
        setEditImageInstruction("");
        setEditReferenceImageUrl("");
    };

    const handleEditSave = async () => {
        if (!editingSection) return;
        setIsSaving(true);
        try {
            await updateCookingSection(
                editingSection.id,
                editContent,
                editImageInstruction,
                editAllowSubmission,
                editReferenceImageUrl
            );

            // Local update optimization
            setSections(prev => prev.map(s =>
                s.id === editingSection.id ? {
                    ...s,
                    content: editContent,
                    imageInstruction: editImageInstruction,
                    referenceImageUrl: editReferenceImageUrl,
                    allowImageSubmission: editAllowSubmission
                } : s
            ));

            setEditingSection(null);
        } catch (error) {
            console.error("Failed to update section:", error);
            alert("保存に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        fullScript, setFullScript,
        isCreatingSections,
        handleCreateSections,
        handleAddSection,
        handleDeleteSection,

        editingSection,
        editContent, setEditContent,
        editImageInstruction, setEditImageInstruction,
        editReferenceImageUrl, setEditReferenceImageUrl,
        editAllowSubmission, setEditAllowSubmission,
        isSaving,
        handleEditStart,
        handleEditCancel,
        handleEditSave
    };
}
