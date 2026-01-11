"use client";

import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip } from "@heroui/react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface HeaderProps {
    user?: {
        name: string;
        email: string;
        image?: string | null;
        role?: string;
        discordUsername?: string | null;
    } | null;
}

export function Header({ user }: HeaderProps) {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case "gicho":
                return <Chip size="sm" className="badge-gicho">儀長</Chip>;
            case "meiyo_giin":
                return <Chip size="sm" className="badge-meiyo-giin">名誉儀員</Chip>;
            case "giin":
                return <Chip size="sm" className="badge-giin">儀員</Chip>;
            case "guest":
                return <Chip size="sm" variant="flat">ゲスト</Chip>;
            default:
                return <Chip size="sm" variant="flat">未ログイン</Chip>;
        }
    };

    if (!user) {
        return (
            <header className="h-16 border-b border-white/5 flex items-center justify-end px-6 glass">
                <a href="/login" className="text-primary hover:underline">
                    ログイン
                </a>
            </header>
        );
    }

    return (
        <header className="h-16 border-b border-white/5 flex items-center justify-end px-6 glass">
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <div className="flex items-center gap-3 cursor-pointer">
                        {getRoleBadge(user.role)}
                        <Avatar
                            size="sm"
                            name={user.name}
                            src={user.image || undefined}
                            classNames={{
                                base: "bg-gradient-to-br from-primary to-secondary",
                            }}
                        />
                    </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                    <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-foreground-muted">{user.email}</p>
                        {user.discordUsername && (
                            <p className="text-xs text-foreground-muted">@{user.discordUsername}</p>
                        )}
                    </DropdownItem>
                    <DropdownItem key="settings" href="/settings">
                        設定
                    </DropdownItem>
                    <DropdownItem key="logout" color="danger" onPress={handleSignOut}>
                        ログアウト
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </header>
    );
}
