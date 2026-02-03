"use client";

import { Button, Card, Input, Alert } from "antd";
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
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#ffdad5]/30 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#fbe7a6]/20 to-transparent rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md bg-[var(--md-sys-color-surface-container-lowest)] rounded-[28px] border-none shadow-none">
                <div className="flex flex-col items-center pb-4 pt-8">
                    <div className="w-20 h-20 bg-[#73342b] rounded-[20px] flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-3xl font-bold text-[#ffdad5]">封</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">新規登録</h1>
                    <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">
                        封解Boxへようこそ
                    </p>
                </div>

                <div className="space-y-4 px-6 pb-8">
                    {error && (
                        <Alert message={error} type="error" showIcon className="rounded-[16px]" />
                    )}

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">名前 <span className="text-red-500">*</span></label>
                        <Input
                            size="large"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            className="rounded-[16px]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">メールアドレス <span className="text-red-500">*</span></label>
                        <Input
                            type="email"
                            size="large"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="rounded-[16px]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">パスワード <span className="text-red-500">*</span></label>
                        <Input.Password
                            size="large"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="rounded-[16px]"
                        />
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">8文字以上</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2 block">パスワード（確認） <span className="text-red-500">*</span></label>
                        <Input.Password
                            size="large"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="rounded-[16px]"
                        />
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        className="mt-2 rounded-full bg-[#73342b] border-none"
                        onClick={handleRegister}
                        loading={isLoading}
                    >
                        登録
                    </Button>

                    <div className="text-center mt-2">
                        <Link href="/login" className="text-sm text-[#73342b] hover:underline">
                            既にアカウントをお持ちの方はこちら
                        </Link>
                    </div>

                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center mt-4">
                        登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。
                    </p>
                </div>
            </Card>
        </div>
    );
}
