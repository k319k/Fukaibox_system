import Sidebar from './Sidebar'
import AppHeader from './Header'

/**
 * FukaiBox Layout - Material 3 デザイン
 * ヘッダー + サイドバー + メインコンテンツ
 */
export default function Layout({ children }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--color-surface)'
        }}>
            {/* Top Header */}
            <AppHeader />

            {/* Body: Sidebar + Content */}
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main style={{
                    flex: 1,
                    padding: '32px 40px',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        maxWidth: 1200,
                        margin: '0 auto'
                    }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
