"use client";

import { Button, Card } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { Section, Project, UserRole } from "@/types/kitchen";
import SectionCard from "./SectionCard";
import CharacterCountDisplay from "./section/CharacterCountDisplay";

interface SectionListProps {
    project: Project;
    sections: Section[];
    userRole: UserRole;
    editorFontSize: number;

    // Script Creation
    fullScript: string;
    onFullScriptChange: (val: string) => void;
    isCreatingSections: boolean;
    onCreateSections: () => void;

    // Section Ops
    onAddSection: (index: number) => void;
    onDeleteSection: (id: string) => void;

    // Edit State
    editingSection: Section | null;
    editContent: string;
    editImageInstruction: string;
    editReferenceImageUrl: string;
    editAllowSubmission: boolean;
    isSaving: boolean;

    onEditStart: (section: Section) => void;
    onEditCancel: () => void;
    onEditSave: () => void;

    onEditContentChange: (val: string) => void;
    onEditImageInstructionChange: (val: string) => void;
    onEditReferenceImageUrlChange: (val: string) => void;
    onEditAllowSubmissionChange: (val: boolean) => void;

    // Proposal State
    proposalSection: Section | null;
    proposalContent: string;

    onProposalOpen: (section: Section) => void;
    onProposalCancel: () => void;
    onProposalSubmit: () => void;
    onProposalContentChange: (val: string) => void;
}

export default function SectionList(props: SectionListProps) {
    const {
        project, sections, userRole, editorFontSize,
        fullScript, onFullScriptChange, isCreatingSections, onCreateSections,
        onAddSection
    } = props;

    // セクションがない場合：台本入力フォーム
    if (sections.length === 0) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 py-8">
                <Card className="card-elevated">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:script-text-outline" className="text-xl" />
                        <h3 className="text-xl font-bold">台本を入力してセクションを作成</h3>
                    </div>
                    <div className="space-y-4">
                        <textarea
                            value={fullScript}
                            onChange={(e) => onFullScriptChange(e.target.value)}
                            className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-[#73342b] focus:border-transparent outline-none bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] resize-y"
                            style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.6 }}
                            placeholder={"ここに台本を貼り付けてください。\n\n空行を入れると、そこで新しいセクションとして分割されます。\n\n(例)\nシーン1のセリフ...\n\nシーン2のセリフ..."}
                        />
                        <CharacterCountDisplay text={fullScript} showSectionPreview={true} />
                        <div className="flex justify-end">
                            <Button
                                type="primary"
                                onClick={onCreateSections}
                                disabled={!fullScript.trim() || isCreatingSections}
                                icon={isCreatingSections ? <LoadingOutlined /> : <Icon icon="mdi:magic-staff" />}
                                className="bg-[#73342b]"
                            >
                                {isCreatingSections ? "セクション分割中..." : "セクションに分割して登録"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // セクションがある場合：リスト表示
    return (
        <div className="space-y-4 pb-20">
            {sections.map((section) => {
                const index = sections.findIndex(s => s.id === section.id);

                return (
                    <div key={section.id} className="space-y-4">
                        {/* 挿入ボタン */}
                        <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                                size="small"
                                shape="round"
                                icon={<PlusOutlined />}
                                onClick={() => onAddSection(index)}
                                className="bg-[#ffdad5] text-[#73342b] border-none"
                            >
                                ここにセクションを追加
                            </Button>
                        </div>

                        <SectionCard
                            section={section}
                            index={index}
                            projectStatus={project.status}
                            userRole={userRole}
                            fontSize={editorFontSize}

                            isEditing={props.editingSection?.id === section.id}
                            isProposing={props.proposalSection?.id === section.id}
                            isSaving={props.isSaving}

                            editContent={props.editContent}
                            editImageInstruction={props.editImageInstruction}
                            editReferenceImageUrl={props.editReferenceImageUrl}
                            editAllowSubmission={props.editAllowSubmission}
                            proposalContent={props.proposalContent}

                            onEditStart={props.onEditStart}
                            onEditCancel={props.onEditCancel}
                            onEditSave={props.onEditSave}
                            onDelete={props.onDeleteSection}

                            onProposalOpen={props.onProposalOpen}
                            onProposalCancel={props.onProposalCancel}
                            onProposalSubmit={props.onProposalSubmit}

                            onEditContentChange={props.onEditContentChange}
                            onEditImageInstructionChange={props.onEditImageInstructionChange}
                            onEditReferenceImageUrlChange={props.onEditReferenceImageUrlChange}
                            onEditAllowSubmissionChange={props.onEditAllowSubmissionChange}
                            onProposalContentChange={props.onProposalContentChange}
                        />

                        {/* 末尾追加ボタン */}
                        {index === sections.length - 1 && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    size="small"
                                    shape="round"
                                    icon={<PlusOutlined />}
                                    onClick={() => onAddSection(index + 1)}
                                    className="bg-[#ffdad5] text-[#73342b] border-none"
                                >
                                    末尾にセクションを追加
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
