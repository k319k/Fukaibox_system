import { getLatestStreams, getLatestShorts } from "@/app/actions/youtube";
import { HomeContent } from "@/components/home/home-content";

export default async function HomePage() {
    // 並列でデータ取得
    const [streams, shorts] = await Promise.all([
        getLatestStreams(1),
        getLatestShorts(4),
    ]);

    const latestStream = streams[0] ?? null;

    return <HomeContent latestStream={latestStream} shorts={shorts} />;
}
