"use client";

import type { YouTubeVideo } from "@/lib/youtube";
import { QuickActions } from "./quick-actions";
import { LiveStreamWidget } from "./live-stream-widget";
import { ShortsGrid } from "./shorts-grid";
import { RankingWidget } from "./ranking-widget";
import { HonoraryMemberWidget } from "./honorary-member-widget";
import { Icon } from "@iconify/react";
import LiveStatusWidget from "@/components/youtube/live-status-widget";

interface HomeContentProps {
    latestStream: YouTubeVideo | null;
    shorts: YouTubeVideo[];
}

export function HomeContent({ latestStream, shorts }: HomeContentProps) {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <LiveStatusWidget />

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
                    <HonoraryMemberWidget />
                </div>
            </div>
        </div>
    );
}
