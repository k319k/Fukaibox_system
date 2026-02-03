"use client";

import { useState } from "react";
import { Input, Button, Card, Spin, Empty } from "antd";
import { SearchOutlined, BookOutlined, GlobalOutlined } from "@ant-design/icons";
import { searchWikiAction, getWikiPageAction } from "@/app/actions/wiki";
import { Icon } from "@iconify/react";

export default function WikiPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPage, setSelectedPage] = useState<{ title: string, content: string } | null>(null);
    const [pageLoading, setPageLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSelectedPage(null);
        try {
            const res = await searchWikiAction(query);
            if (res.success) {
                setResults(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPage = async (title: string) => {
        setPageLoading(true);
        try {
            const res = await getWikiPageAction(title);
            if (res.success) {
                setSelectedPage({ title, content: res.data || "詳細な内容はありません。" });
            }
        } finally {
            setPageLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 mb-8">
                 <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
                    <Icon icon="mdi:book-open-page-variant-outline" className="text-[var(--md-sys-color-primary)]" />
                    界域百科事典検索
                </h1>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">
                    環状世界Wikiの膨大なデータベースから知識を検索します。
                </p>
            </div>

            <div className="flex gap-2">
                <Input 
                    size="large" 
                    placeholder="検索キーワードを入力（例: 感情動力、フカイ）" 
                    prefix={<SearchOutlined />} 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onPressEnter={handleSearch}
                />
                <Button type="primary" size="large" onClick={handleSearch} loading={loading}>
                    検索
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search Results */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <SearchOutlined /> 検索結果
                    </h2>
                    {loading ? (
                        <div className="text-center py-8"><Spin /></div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((item: any) => (
                                <Card 
                                    key={item.pageid} 
                                    hoverable 
                                    className={`cursor-pointer transition-colors ${selectedPage?.title === item.title ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-secondary-container)]' : ''}`}
                                    onClick={() => handleSelectPage(item.title)}
                                    size="small"
                                >
                                    <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                                    <div 
                                        className="text-xs text-gray-500 line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: item.snippet }}
                                    />
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Empty description="検索結果なし" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </div>

                {/* Page Content */}
                <div className="md:col-span-2">
                    <Card className="min-h-[500px]" title={selectedPage?.title || "詳細プレビュー"}>
                        {pageLoading ? (
                            <div className="flex h-full items-center justify-center min-h-[400px]">
                                <Spin size="large" tip="読み込み中..." />
                            </div>
                        ) : selectedPage ? (
                            <div className="space-y-4">
                                <p className="leading-relaxed whitespace-pre-wrap text-[var(--md-sys-color-on-surface)]">
                                    {selectedPage.content}
                                </p>
                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <Button 
                                        type="link" 
                                        href={`https://kanjou.miraheze.org/wiki/${encodeURIComponent(selectedPage.title)}`} 
                                        target="_blank"
                                        icon={<GlobalOutlined />}
                                    >
                                        Wikiで全文を読む
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[400px]">
                                <BookOutlined className="text-4xl mb-4 opacity-50" />
                                <p>左側のリストから項目を選択してください</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
