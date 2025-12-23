
/**
 * OnlineStatusBadge - ユーザーのオンライン/オフラインステータスを表示
 * @param {boolean} isOnline - オンラインステータス
 * @param {number} size - バッジサイズ（デフォルト: 8）
 */
export default function OnlineStatusBadge({ isOnline, size = 8 }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: isOnline ? '#52c41a' : '#d9d9d9',
                border: '2px solid white',
            }}
        />
    )
}
