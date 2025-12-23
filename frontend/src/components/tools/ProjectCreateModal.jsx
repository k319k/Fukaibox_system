/**
 * ProjectCreateModal - プロジェクト作成モーダル
 * Sandbox / Embed タイプ選択対応
 */
import { useState } from 'react'
import { Modal, Form, Input, Select, Radio, message, Alert } from 'antd'
import { Code, Link } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useToolsStore } from '../../store/toolsStore'

const { TextArea } = Input

const EMBED_SOURCES = [
    { value: 'gemini_canvas', label: 'Gemini Canvas' },
    { value: 'gpt_canvas', label: 'GPT Canvas' },
    { value: 'claude_artifacts', label: 'Claude Artifacts' },
]

/**
 * @param {Object} props
 * @param {boolean} props.open - モーダル表示状態
 * @param {Function} props.onClose - 閉じるハンドラ
 */
export default function ProjectCreateModal({ open, onClose }) {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [projectType, setProjectType] = useState('sandbox')

    const { token } = useAuthStore()
    const { createProject, sandboxHealth } = useToolsStore()

    const sandboxAvailable = sandboxHealth?.sandbox_status === 'ok'

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            await createProject(token, {
                name: values.name,
                description: values.description,
                project_type: projectType,
                embed_source: projectType === 'embed' ? values.embed_source : null,
                embed_url: projectType === 'embed' ? values.embed_url : null,
                html_content: projectType === 'sandbox' ? values.html_content : null,
            })

            message.success('プロジェクトを作成しました！')
            form.resetFields()
            onClose()
        } catch (error) {
            message.error(error.response?.data?.detail || '作成に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        setProjectType('sandbox')
        onClose()
    }

    return (
        <Modal
            title="新規プロジェクト作成"
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="作成"
            cancelText="キャンセル"
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ project_type: 'sandbox' }}
            >
                {/* Project Type */}
                <Form.Item label="プロジェクトタイプ">
                    <Radio.Group
                        value={projectType}
                        onChange={e => setProjectType(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="sandbox">
                            <Code size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            Sandbox
                        </Radio.Button>
                        <Radio.Button value="embed">
                            <Link size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            埋め込み
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {/* Sandbox Warning */}
                {projectType === 'sandbox' && !sandboxAvailable && (
                    <Alert
                        message="Sandboxサーバーが利用できません"
                        description="ProDeskサーバーがオフラインのため、ローカルプロジェクトとして作成されます。"
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Name */}
                <Form.Item
                    name="name"
                    label="プロジェクト名"
                    rules={[{ required: true, message: 'プロジェクト名を入力してください' }]}
                >
                    <Input placeholder="My Awesome Tool" maxLength={200} />
                </Form.Item>

                {/* Description */}
                <Form.Item name="description" label="説明">
                    <TextArea
                        placeholder="このツールについての説明..."
                        rows={3}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                {/* Embed-specific fields */}
                {projectType === 'embed' && (
                    <>
                        <Form.Item
                            name="embed_source"
                            label="埋め込みソース"
                            rules={[{ required: true, message: 'ソースを選択してください' }]}
                        >
                            <Select options={EMBED_SOURCES} placeholder="Canvas タイプを選択" />
                        </Form.Item>

                        <Form.Item
                            name="embed_url"
                            label="埋め込みURL"
                            rules={[
                                { required: true, message: 'URLを入力してください' },
                                { type: 'url', message: '有効なURLを入力してください' }
                            ]}
                        >
                            <Input placeholder="https://..." />
                        </Form.Item>
                    </>
                )}

                {/* Sandbox initial HTML */}
                {projectType === 'sandbox' && (
                    <Form.Item name="html_content" label="初期HTMLコード（オプショナル）">
                        <TextArea
                            placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>Hello World!</body>&#10;</html>"
                            rows={5}
                            style={{ fontFamily: 'monospace' }}
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    )
}
