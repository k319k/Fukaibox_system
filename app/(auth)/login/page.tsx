"use client";

import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { Package, LogIn, User, ArrowLeft, AlertCircle } from "lucide-react";

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
            await signIn.email({
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

    // Discord SVG Icon
    const DiscordIcon = () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    );

    return (
        <div className="min-h-screen min-h-dvh flex items-center justify-center relative overflow-hidden bg-[var(--md-sys-color-surface)] px-4 py-8">
            {/* Background Decoration - Subtle */}
            <div className="absolute top-[-30%] left-[-15%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-[var(--md-sys-color-primary-container)] rounded-full blur-[120px] md:blur-[150px] opacity-25 pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-15%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-[var(--md-sys-color-tertiary-container)] rounded-full blur-[120px] md:blur-[150px] opacity-15 pointer-events-none" />

            {/* Login Card */}
            <Card className="w-full max-w-sm md:max-w-md bg-[var(--md-sys-color-surface-container-lowest)] !rounded-3xl shadow-sm border-none relative z-10">
                <CardHeader className="flex flex-col gap-3 items-center justify-center pt-8 md:pt-12 pb-2 md:pb-4 px-6 md:px-10">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--md-sys-color-primary-container)] rounded-2xl flex items-center justify-center">
                        <Package strokeWidth={1.5} className="w-7 h-7 md:w-8 md:h-8 text-[var(--md-sys-color-on-primary-container)]" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl md:headline-medium text-[var(--md-sys-color-on-surface)] font-extrabold tracking-tight">封解Box</h1>
                        <p className="body-medium md:body-large text-[var(--md-sys-color-on-surface-variant)] mt-1">メンバー専用ポータル</p>
                    </div>
                </CardHeader>
                <CardBody className="px-6 md:px-10 pb-8 md:pb-10 space-y-4 md:space-y-5">
                    {error && (
                        <div className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-3 md:p-4 rounded-2xl flex items-center gap-3 text-sm">
                            <AlertCircle strokeWidth={1.5} className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {!isGuestMode ? (
                        <div className="space-y-3 md:space-y-4">
                            {/* Discordログイン - Primary Action (Filled) */}
                            <Button
                                color="primary"
                                size="lg"
                                className="w-full font-semibold !rounded-full h-12 md:h-14 gap-3"
                                onPress={handleDiscordLogin}
                                isLoading={isLoading}
                            >
                                {!isLoading && <DiscordIcon />}
                                <span>Discordでログイン</span>
                            </Button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 py-1">
                                <div className="flex-1 h-px bg-[var(--md-sys-color-outline-variant)]" />
                                <span className="body-small text-[var(--md-sys-color-on-surface-variant)]">または</span>
                                <div className="flex-1 h-px bg-[var(--md-sys-color-outline-variant)]" />
                            </div>

                            {/* ゲストログインへ切り替え - Secondary Action (Outlined) */}
                            <Button
                                variant="bordered"
                                size="lg"
                                className="w-full !rounded-full h-11 md:h-12 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] gap-3"
                                onPress={() => setIsGuestMode(true)}
                            >
                                <User strokeWidth={1.5} className="w-5 h-5" />
                                <span>ゲストログイン</span>
                            </Button>

                            {/* ログインせずに続行 - Tertiary Action (Ghost) */}
                            <Button
                                variant="light"
                                size="lg"
                                className="w-full !rounded-full h-10 md:h-11 text-[var(--md-sys-color-on-surface-variant)]"
                                onPress={handleContinueWithoutLogin}
                            >
                                ログインせずに続行
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* ゲストログインフォーム */}
                            <Input
                                label="ユーザー名 / メールアドレス"
                                variant="bordered"
                                value={username}
                                onValueChange={setUsername}
                                isDisabled={isLoading}
                                size="lg"
                                classNames={{
                                    inputWrapper: "!rounded-2xl border-[var(--md-sys-color-outline-variant)]",
                                }}
                            />
                            <Input
                                label="パスワード"
                                type="password"
                                variant="bordered"
                                value={password}
                                onValueChange={setPassword}
                                isDisabled={isLoading}
                                size="lg"
                                classNames={{
                                    inputWrapper: "!rounded-2xl border-[var(--md-sys-color-outline-variant)]",
                                }}
                            />

                            <Button
                                color="primary"
                                size="lg"
                                className="w-full font-semibold !rounded-full h-12 md:h-14 gap-3"
                                onPress={handleGuestLogin}
                                isLoading={isLoading}
                            >
                                {!isLoading && <LogIn strokeWidth={1.5} className="w-5 h-5" />}
                                <span>ログイン</span>
                            </Button>

                            <Button
                                variant="light"
                                size="lg"
                                className="w-full !rounded-full h-10 md:h-11 gap-2"
                                onPress={() => setIsGuestMode(false)}
                            >
                                <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
                                <span>戻る</span>
                            </Button>
                        </div>
                    )}

                    <div className="text-center pt-2 md:pt-4">
                        <Link href="/register" className="label-large text-[var(--md-sys-color-primary)] hover:underline transition-colors">
                            新規登録はこちら
                        </Link>
                    </div>

                    <p className="body-small text-center text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                        ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
