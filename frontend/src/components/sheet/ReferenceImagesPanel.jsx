import { Upload, Image, Button, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'

// Helper function to get API URL based on environment
const getApiUrl = () => {
    return window.location.origin.includes('localhost')
        ? 'http://localhost:8000'
        : 'https://fukaibox.kanjousekai.jp/api'
}

/**
 * Reference Images Panel Component
 * Displays and manages reference images for a section
 * 
 * @param {Object} props
 * @param {Object} props.section - Section object with reference_images array
 * @param {Function} props.onUpload - Callback when image is uploaded
 * @param {Function} props.onDelete - Callback when image is deleted
 * @param {boolean} props.isGicho - Whether current user is Gicho
 */
export default function ReferenceImagesPanel({ section, onUpload, onDelete, isGicho }) {
    const { token } = useAuthStore()
    const apiUrl = getApiUrl()

    const handleUpload = async ({ file }) => {
        if (!isGicho) {
            message.error('儀長のみアップロード可能です')
            return
        }

        try {
            await onUpload({ file })
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (index) => {
        try {
            await onDelete(index)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>参考画像</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {section.reference_images && section.reference_images.length > 0 && (
                    section.reference_images.map((img, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                            <Image
                                src={`${apiUrl}${img}`}
                                width={100}
                                height={100}
                                style={{ objectFit: 'cover', borderRadius: 4 }}
                            />
                            {isGicho && (
                                <Button
                                    type="primary"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        padding: '2px 6px'
                                    }}
                                />
                            )}
                        </div>
                    ))
                )}
                {isGicho && (
                    <Upload
                        customRequest={handleUpload}
                        showUploadList={false}
                        accept="image/*"
                    >
                        <div style={{
                            width: 100,
                            height: 100,
                            border: '2px dashed #d9d9d9',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}>
                            <PlusOutlined style={{ fontSize: 24, color: '#999' }} />
                        </div>
                    </Upload>
                )}
            </div>
        </div>
    )
}
