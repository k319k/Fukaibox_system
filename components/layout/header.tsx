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
                    aria-label="ユーザーメニュー"
                    className="w-64"
                    itemClasses={{
                        base: "gap-4 h-12 rounded-lg data-[hover=true]:bg-[var(--md-sys-color-surface-container-high)] transition-colors",
                    }}
                    classNames={{
                        base: "before:bg-[var(--md-sys-color-surface-container-lowest)] before:backdrop-blur-md shadow-xl border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-2",
                    }}
                >
                    <DropdownItem key="profile" className="h-16 gap-3 opacity-100 cursor-default hover:!bg-transparent">
                        <User
                            name={user.name}
                            description={
                                <div className="flex flex-col gap-1 mt-1">
                                    <span className="text-[var(--md-sys-color-on-surface-variant)] label-small">{user.email}</span>
                                    <div className="flex gap-1">
                                        <Badge content="" color="primary" size="sm" shape="circle" className="hidden">
                                            {/* Dummy for alignment */}
                                        </Badge>
                                        <div className={`px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${user.role === 'gicho' ? 'bg-[#40000A] text-[#FFDAD9] border border-[#FFB4AB]/30' :
                                                user.role === 'meiyo_giin' ? 'bg-[#1E1B16] text-[#E8E2D9] border border-[#D1C6B5]/30' :
                                                    user.role === 'giin' ? 'bg-[#001F25] text-[#A6EEFF] border border-[#4FD8EB]/30' :
                                                        'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                                            }`}>
                                            {user.role}
                                        </div>
                                    </div>
                                </div>
                            }
                            avatarProps={{
                                src: user.image || undefined,
                                classNames: {
                                    base: "bg-gradient-to-br from-primary to-secondary ring-2 ring-[var(--md-sys-color-outline-variant)]",
                                },
                            }}
                        />
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

