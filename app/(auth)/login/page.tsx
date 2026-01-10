"use client";

import { Button, Card, CardBody, CardHeader, Input, Divider } from "@heroui/react";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

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
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* 背景装飾 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md glass">
                <CardHeader className="flex flex-col items-center pb-0 pt-8">
                    <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-3xl font-bold text-white">封</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">封解Box</h1>
                    <p className="text-foreground-muted text-sm mt-1">
                        封解公儀の統合プラットフォーム
                    </p>
                </CardHeader>

                <CardBody className="gap-4 px-6 pb-8">
                    {error && (
                        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    {!isGuestMode ? (
                        <>
                            {/* Discordログイン */}
                            <Button
                                color="primary"
                                variant="shadow"
                                size="lg"
                                className="w-full font-medium"
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

                            <Divider className="my-2" />

                            {/* ゲストログインへ切り替え */}
                            <Button
                                variant="bordered"
                                size="lg"
                                className="w-full"
                                onPress={() => setIsGuestMode(true)}
                            >
                                ゲストログイン
                            </Button>

                            <Divider className="my-2" />

                            {/* ログインせずに続行 */}
                            <Button
                                variant="light"
                                size="lg"
                                className="w-full text-foreground-muted"
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
                            />
                            <Input
                                label="パスワード"
                                type="password"
                                variant="bordered"
                                value={password}
                                onValueChange={setPassword}
                                isDisabled={isLoading}
                            />

                            <Button
                                color="primary"
                                variant="shadow"
                                size="lg"
                                className="w-full mt-2"
                                onPress={handleGuestLogin}
                                isLoading={isLoading}
                            >
                                ログイン
                            </Button>

                            <Divider className="my-2" />

                            <Button
                                variant="light"
                                size="lg"
                                className="w-full"
                                onPress={() => setIsGuestMode(false)}
                            >
                                戻る
                            </Button>
                        </>
                    )}

                    <p className="text-xs text-foreground-muted text-center mt-4">
                        ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
