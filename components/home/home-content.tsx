"use client";

import type { YouTubeVideo } from "@/lib/youtube";
import { QuickActions } from "./quick-actions";
import { LiveStreamWidget } from "./live-stream-widget";
import { ShortsGrid } from "./shorts-grid";
import { RankingWidget } from "./ranking-widget";

interface HomeContentProps {
    latestStream: YouTubeVideo | null;
    shorts: YouTubeVideo[];
}

export function HomeContent({ latestStream, shorts }: HomeContentProps) {
    return (
        <div className="flex-1 space-y-10 p-8 max-w-[1600px] mx-auto">
            {/* Quick Actions Grid */}
            <QuickActions />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Area (2 cols) */}
                <div className="lg:col-span-2 space-y-10">
                    <LiveStreamWidget latestStream={latestStream} />
                    <ShortsGrid shorts={shorts} />
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-10">
                    <RankingWidget />
                </div>
            </div>
        </div>
    );
}
