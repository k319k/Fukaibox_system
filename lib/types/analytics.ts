import { z } from "zod";

export const VideoAnalyticsRowSchema = z.object({
    // Basic Info
    publicId: z.string().optional(), // 公開番号? No standard ID for this, maybe just videoId or sequential
    videoId: z.string(),
    title: z.string(),
    author: z.string().optional(), // 原作者
    distributor: z.string().optional(), // 流通名
    publishedAt: z.date(), // 日付
    dayOfWeek: z.string(), // 曜日

    // Metrics
    views: z.number().default(0), // 再生回数
    likes: z.number().default(0), // 高評価数
    dislikes: z.number().default(0), // 低評価数
    comments: z.number().default(0), // コメント数
    subscribersGained: z.number().default(0).optional(), // 登録者数 (This video gained)

    // Derived / Content
    durationSec: z.number().default(0), // 動画尺(秒)
    durationFormatted: z.string(), // 動画尺(mm:ss)
    charCount: z.number().default(0), // 文字数
    compressionRate: z.number().default(0), // 圧縮度(文字数/秒)? User said "秒(一文字)" -> Seconds per Char?
    compressionRateSecPerChar: z.number().default(0), // 圧縮度(秒(一文字))
    compressionRateCharPerSec: z.number().default(0), // 圧縮度(文字数(1s))

    // Engagement / Calculation
    engagementView: z.number().default(0), // エンゲジ ビュ
    likeRate: z.number().default(0), // 高評価率
    dislikeRate: z.number().default(0), // 低評価率

    // Traffic / Demographics (Might be empty initially)
    trafficSourceShorts: z.number().optional(), // ショト フィド
    trafficSourceChannel: z.number().optional(), // チャンネル ペジ
    trafficSourceBrowse: z.number().optional(), // ブラウジング機能
    trafficSourceSearch: z.number().optional(), // YouTube 検索
    trafficSourceSound: z.number().optional(), // 音声のペジ
    trafficSourceOther: z.number().optional(), // その他

    deviceMobile: z.number().optional(), // 携帯
    devicePC: z.number().optional(), // PC
    deviceTablet: z.number().optional(), // タブレット
    deviceTV: z.number().optional(), // テレビ
    deviceOther: z.number().optional(), // その他

    genderFemale: z.number().optional(), // 女性
    genderMale: z.number().optional(), // 男性

    age13_17: z.number().optional(),
    age18_24: z.number().optional(),
    age25_34: z.number().optional(),
    age35_44: z.number().optional(),
    age45_54: z.number().optional(),
    age55_64: z.number().optional(),
    age65_plus: z.number().optional(),

    // Retention (Shorts)
    shortsViewed: z.number().optional(), // 視聴を継続
    shortsSwiped: z.number().optional(), // スワイプして消去

    // Scores
    deviationValue: z.number().optional(), // 偏差値
    qualityIndex: z.number().optional(), // ショト品質指数
    diffusionRate: z.number().optional(), // 拡散率
});

export type VideoAnalyticsRow = z.infer<typeof VideoAnalyticsRowSchema>;
