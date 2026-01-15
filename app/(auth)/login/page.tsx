"use client";

import { Button, Card, CardBody, CardHeader, Input, Divider } from "@heroui/react";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";

export default function LoginPage() {
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDiscordLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            await signIn.social({ provider: "discord" });
        } catch {
            setError("Discordログインに失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        if (!username || !password) {
            setError("ユーザー名とパスワードを入力してください");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const result = await signIn.email({
                email: username,
                password: password,
            });
            window.location.href = "/";
        } catch {
            setError("ログインに失敗しました。認証情報を確認してください。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueWithoutLogin = () => {
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--md-sys-color-surface-container)] px-4">
            {/* Background Decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--md-sys-color-primary-container)] rounded-full blur-[100px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--md-sys-color-secondary-container)] rounded-full blur-[100px] opacity-40 pointer-events-none" />

            {/* Login Card */}
            <Card className="w-full max-w-md surface-container-lowest shape-xl shadow-[var(--md-sys-elevation-3)] relative z-10">
                <CardHeader className="flex flex-col gap-2 items-center justify-center pt-10 pb-2">
                    <div className="w-16 h-16 bg-[var(--md-sys-color-primary)] rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-3">
                        <span className="text-3xl text-[var(--md-sys-color-on-primary)]">📦</span>
                    </div>
                    <h1 className="headline-medium text-[var(--md-sys-color-on-surface)]">封解Box</h1>
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)]">メンバー専用ポータル</p>
                </CardHeader>
                <CardBody className="px-10 pb-10 space-y-6">
                    {error && (
                        <div className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                            <span className="text-lg">⚠️</span>
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {!isGuestMode ? (
                        <>
                            {/* Discordログイン - Primary Action */}
                            <Button
                                color="primary"
                                variant="shadow"
                                size="lg"
                                className="w-full font-semibold shape-full"
                                onPress={handleDiscordLogin}
                                isLoading={isLoading}
                                startContent={
                                    !isLoading && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                        </svg>
                                    )
                                }
                            >
                                Discordでログイン
                            </Button>

                            <Divider className="my-3" />

                            {/* ゲストログインへ切り替え - Secondary Action */}
                            <Button
                                variant="bordered"
                                size="lg"
                                className="w-full shape-full border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)]"
                                onPress={() => setIsGuestMode(true)}
                            >
                                ゲストログイン
                            </Button>

                            <Divider className="my-3" />

                            {/* ログインせずに続行 - Tertiary Action */}
                            <Button
                                variant="light"
                                size="lg"
                                className="w-full shape-full text-[var(--md-sys-color-on-surface-variant)]"
                                onPress={handleContinueWithoutLogin}
                            >
                                ログインせずに続行
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* ゲストログインフォーム */}
                            <Input
                                label="ユーザー名 / メールアドレス"
                                variant="bordered"
                                value={username}
                                onValueChange={setUsername}
                                isDisabled={isLoading}
                                classNames={{
                                    inputWrapper: "shape-md border-[var(--md-sys-color-outline)]",
                                }}
                            />
                            <Input
                                label="パスワード"
                                type="password"
                                variant="bordered"
                                value={password}
                                onValueChange={setPassword}
                                isDisabled={isLoading}
                                classNames={{
                                    inputWrapper: "shape-md border-[var(--md-sys-color-outline)]",
                                }}
                            />

                            <Button
                                color="primary"
                                variant="shadow"
                                size="lg"
                                className="w-full mt-2 font-semibold shape-full"
                                onPress={handleGuestLogin}
                                isLoading={isLoading}
                            >
                                ログイン
                            </Button>

                            <Divider className="my-3" />

                            <Button
                                variant="light"
                                size="lg"
                                className="w-full shape-full"
                                onPress={() => setIsGuestMode(false)}
                            >
                                戻る
                            </Button>
                        </>
                    )}

                    <div className="text-center mt-5">
                        <Link href="/register" className="label-large text-[var(--md-sys-color-primary)] hover:underline transition-colors">
                            新規登録はこちら
                        </Link>
                    </div>

                    <p className="body-small text-center mt-4">
                        ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}

