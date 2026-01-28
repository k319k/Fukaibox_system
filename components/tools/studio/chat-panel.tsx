"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { generateToolsApp } from "@/app/actions/tools-ai";

interface ChatPanelProps {
    onCodeGenerated: (files: Record<string, string>, description: string) => void;
}

export function ChatPanel({ onCodeGenerated }: ChatPanelProps) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "何を作りますか？ (例: 「シンプルなToDoアプリを作って」「計算機を作って」)" }
    ]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const originalInput = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: originalInput }]);
        setLoading(true);

        try {
            const result = await generateToolsApp(originalInput);

            if (result.success && result.data) {
                setMessages(prev => [...prev, { role: 'ai', content: `作成しました: ${result.data.description}` }]);
                onCodeGenerated(result.data.files, result.data.description);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: `エラーが発生しました: ${result.error}` }]);
            }
        } catch (e: unknown) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'ai', content: "通信エラーが発生しました。" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900 text-white border-r border-zinc-800">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <h2 className="font-bold text-lg">Tools Studio (AI)</h2>
                <p className="text-xs text-zinc-400">Powered by OpenRouter</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-200'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 p-3 rounded-lg flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs text-zinc-400">Generating...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="作りたいアプリを説明してください..."
                        className="flex-1 bg-zinc-800 border-none rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 resize-none h-20"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-md flex items-center justify-center self-end"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
