/**
 * VotingButton - 高評価/低評価ボタン
 */
import { Button, Space, message } from 'antd'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useToolsStore } from '../../store/toolsStore'

/**
 * @param {Object} props
 * @param {string} props.projectId - プロジェクトID
 * @param {number} props.upvotes - 高評価数
 * @param {number} props.downvotes - 低評価数
 * @param {boolean|null} props.userVote - 現在のユーザー投票 (true=up, false=down, null=none)
 */
export default function VotingButton({ projectId, upvotes, downvotes, userVote }) {
    const { token, isLoggedIn } = useAuthStore()
    const { voteProject, removeVote } = useToolsStore()

    const handleVote = async (isUpvote) => {
        if (!isLoggedIn) {
            message.info('投票するにはログインが必要です')
            return
        }

        try {
            if (userVote === isUpvote) {
                // 同じ投票をもう一度クリック → 取り消し
                await removeVote(token, projectId)
            } else {
                await voteProject(token, projectId, isUpvote)
            }
        } catch {
            message.error('投票に失敗しました')
        }
    }

    return (
        <Space size={4}>
            <Button
                type={userVote === true ? 'primary' : 'default'}
                size="small"
                icon={<ThumbsUp size={14} />}
                onClick={(e) => { e.stopPropagation(); handleVote(true) }}
                style={userVote === true ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
            >
                {upvotes}
            </Button>
            <Button
                type={userVote === false ? 'primary' : 'default'}
                size="small"
                danger={userVote === false}
                icon={<ThumbsDown size={14} />}
                onClick={(e) => { e.stopPropagation(); handleVote(false) }}
            >
                {downvotes}
            </Button>
        </Space>
    )
}
