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
                return <Chip size="sm" className="badge-guest">ゲスト</Chip>;
            default:
                return <Chip size="sm" className="badge-guest">未ログイン</Chip>;
        }
    };

    if (!user) {
        return (
            <header className="h-16 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-end px-6 surface-container-lowest">
                <a href="/login" className="title-medium text-[var(--md-sys-color-primary)] hover:underline transition-colors">
                    ログイン
                </a>
            </header>
        );
    }

    return (
        <header className="h-16 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-end px-6 surface-container-lowest">
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <div className="flex items-center gap-3 cursor-pointer p-2 shape-lg hover:surface-container-high transition-colors">
                        {getRoleBadge(user.role)}
                        <Avatar
                            size="sm"
                            name={user.name}
                            src={user.image || undefined}
                            classNames={{
                                base: "bg-gradient-to-br from-primary to-secondary ring-2 ring-[var(--md-sys-color-outline-variant)]",
                            }}
                        />
                    </div>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="User menu"
                    classNames={{
                        base: "surface-container-lowest shape-lg",
                    }}
                >
                    <DropdownItem key="profile" className="h-16 gap-2" textValue="Profile">
                        <p className="title-medium">{user.name}</p>
                        <p className="body-small">{user.email}</p>
                        {user.discordUsername && (
                            <p className="body-small">@{user.discordUsername}</p>
                        )}
                    </DropdownItem>
                    <DropdownItem key="settings" href="/settings" className="title-small">
                        設定
                    </DropdownItem>
                    <DropdownItem key="logout" color="danger" onPress={handleSignOut} className="title-small text-[var(--md-sys-color-error)]">
                        ログアウト
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </header>
    );
}

