"use client";

import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useState } from "react";
import { registerGuest } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setError("");

        // バリデーション
        if (!name || !email || !password) {
            setError("全ての項目を入力してください");
            return;
        }

        if (password !== confirmPassword) {
            setError("パスワードが一致しません");
            return;
        }

        if (password.length < 8) {
            setError("パスワードは8文字以上にしてください");
            return;
        }

        setIsLoading(true);

        try {
            const result = await registerGuest(email, password, name);

            if (result.success) {
                // 登録成功、ログインページへリダイレクト
                router.push("/login?registered=true");
            } else {
                setError(result.error || "登録に失敗しました");
            }
        } catch (err) {
            setError("登録中にエラーが発生しました");
        } finally {
            setIsLoading(false);
        }
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
                    <h1 className="text-2xl font-bold text-foreground">新規登録</h1>
                    <p className="text-foreground-muted text-sm mt-1">
                        封解Boxへようこそ
                    </p>
                </CardHeader>

                <CardBody className="gap-4 px-6 pb-8">
                    {error && (
                        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="名前"
                        variant="bordered"
                        value={name}
                        onValueChange={setName}
                        isDisabled={isLoading}
                        isRequired
                    />

                    <Input
                        label="メールアドレス"
                        type="email"
                        variant="bordered"
                        value={email}
                        onValueChange={setEmail}
                        isDisabled={isLoading}
                        isRequired
                    />

                    <Input
                        label="パスワード"
                        type="password"
                        variant="bordered"
                        value={password}
                        onValueChange={setPassword}
                        isDisabled={isLoading}
                        isRequired
                        description="8文字以上"
                    />

                    <Input
                        label="パスワード（確認）"
                        type="password"
                        variant="bordered"
                        value={confirmPassword}
                        onValueChange={setConfirmPassword}
                        isDisabled={isLoading}
                        isRequired
                    />

                    <Button
                        color="primary"
                        variant="shadow"
                        size="lg"
                        className="w-full mt-2"
                        onPress={handleRegister}
                        isLoading={isLoading}
                    >
                        登録
                    </Button>

                    <div className="text-center mt-2">
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            既にアカウントをお持ちの方はこちら
                        </Link>
                    </div>

                    <p className="text-xs text-foreground-muted text-center mt-4">
                        登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
