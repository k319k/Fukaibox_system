import { Empty as AntEmpty, Button } from 'antd'
import { FileImageOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons'

/**
 * FukaiBox Empty State Component
 * リッチでフレンドリーな空の状態
 */
export default function EmptyState({
    type = 'sheets',
    onAction,
    actionText,
    showAction = false,
    title,
    description
}) {
    const emptyConfig = {
        sheets: {
            icon: <InboxOutlined style={{ fontSize: 120, color: '#B3424A', opacity: 0.4 }} />,
            defaultTitle: 'シートがまだありません',
            defaultDescription: '新しいシートを作成して、素晴らしい作品作りを始めましょう！',
            actionIcon: <PlusOutlined />
        },
        images: {
            icon: <FileImageOutlined style={{ fontSize: 120, color: '#B3424A', opacity: 0.4 }} />,
            defaultTitle: '画像がまだありません',
            defaultDescription: 'クリエイティブな画像をアップロードして、プロジェクトを彩りましょう',
            actionIcon: <PlusOutlined />
        },
        search: {
            icon: <InboxOutlined style={{ fontSize: 120, color: '#B3424A', opacity: 0.4 }} />,
            defaultTitle: '検索結果が見つかりませんでした',
            defaultDescription: '別のキーワードや条件で、もう一度探してみてください',
            actionIcon: null
        }
    }

    const config = emptyConfig[type] || emptyConfig.sheets

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 32px',
            minHeight: '500px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(253, 250, 245, 0.5) 0%, rgba(179, 66, 74, 0.03) 100%)',
            borderRadius: '24px'
        }}>
            {/* Large Icon with Animation */}
            <div style={{
                marginBottom: '40px',
                animation: 'float 3s ease-in-out infinite'
            }}>
                {config.icon}
            </div>

            {/* Title */}
            <h2 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#121212',
                marginBottom: '16px',
                lineHeight: 1.4
            }}>
                {title || config.defaultTitle}
            </h2>

            {/* Description */}
            <p style={{
                fontSize: '16px',
                color: 'rgba(18, 18, 18, 0.6)',
                marginBottom: showAction ? '48px' : '24px',
                maxWidth: '480px',
                lineHeight: 1.6
            }}>
                {description || config.defaultDescription}
            </p>

            {/* Action Button */}
            {showAction && onAction && (
                <Button
                    type="primary"
                    size="large"
                    icon={config.actionIcon}
                    onClick={onAction}
                    style={{
                        height: '56px',
                        fontSize: '16px',
                        padding: '0 40px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(179, 66, 74, 0.25)'
                    }}
                >
                    {actionText || '新規作成'}
                </Button>
            )}

            {/* Floating Animation CSS */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    )
}
