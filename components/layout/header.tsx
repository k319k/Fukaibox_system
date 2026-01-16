"use client";

import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, User } from "@heroui/react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Settings, LogOut, User as UserIcon, ChevronDown } from "lucide-react";

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

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case "gicho": return "儀長";
            case "meiyo_giin": return "名誉儀員";
            case "giin": return "儀員";
            case "guest": return "ゲスト";
            default: return "未ログイン";
        }
    };

    const getRoleColor = (role?: string) => {
        switch (role) {
            case "gicho": return "bg-[#40000A] text-[#FFDAD9]";
            case "meiyo_giin": return "bg-[#1E1B16] text-[#E8E2D9]";
            case "giin": return "bg-[#001F25] text-[#A6EEFF]";
            default: return "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]";
        }
    };

    if (!user) {
        return (
            <header className="h-20 flex items-center justify-end px-8 bg-[var(--md-sys-color-surface-container-lowest)]/95 backdrop-blur-xl shadow-sm border-b border-[var(--md-sys-color-outline-variant)]/30">
                <a href="/login" className="title-medium text-[var(--md-sys-color-primary)] hover:underline transition-colors flex items-center gap-2 tracking-tight">
                    <UserIcon strokeWidth={1.5} className="w-5 h-5" />
                    ログイン
                </a>
            </header>
        );
    }

    return (
        <header className="h-20 flex items-center justify-end px-8 bg-[var(--md-sys-color-surface-container-lowest)]/95 backdrop-blur-xl shadow-sm border-b border-[var(--md-sys-color-outline-variant)]/30">
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <div className="flex items-center gap-4 cursor-pointer p-3 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                            <Chip
                                size="sm"
                                className={`${getRoleColor(user.role)} rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase`}
                            >
                                {getRoleLabel(user.role)}
                            </Chip>
                            <span className="title-small text-[var(--md-sys-color-on-surface)] font-medium hidden md:block">
                                {user.name}
                            </span>
                        </div>
                        <Avatar
                            size="md"
                            name={user.name}
                            src={user.image || undefined}
                            classNames={{
                                base: "ring-2 ring-[var(--md-sys-color-primary)]/20 shadow-md",
                            }}
                        />
                        <ChevronDown strokeWidth={1.5} className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition-colors" />
                    </div>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="ユーザーメニュー"
                    className="w-72"
                    itemClasses={{
                        base: "gap-4 h-14 rounded-2xl data-[hover=true]:bg-[var(--md-sys-color-surface-container-high)] transition-colors",
                    }}
                    classNames={{
                        base: "bg-white/95 backdrop-blur-xl shadow-xl border-none !rounded-[24px] p-3",
                    }}
                >
                    <DropdownItem key="profile" className="h-20 gap-4 opacity-100 cursor-default hover:!bg-transparent rounded-2xl">
                        <User
                            name={<span className="title-medium font-bold">{user.name}</span>}
                            description={
                                <div className="flex flex-col gap-2 mt-1">
                                    <span className="text-[var(--md-sys-color-on-surface-variant)] label-small">{user.email}</span>
                                    <Chip
                                        size="sm"
                                        className={`${getRoleColor(user.role)} rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase w-fit`}
                                    >
                                        {getRoleLabel(user.role)}
                                    </Chip>
                                </div>
                            }
                            avatarProps={{
                                src: user.image || undefined,
                                size: "lg",
                                classNames: {
                                    base: "ring-2 ring-[var(--md-sys-color-primary)]/20 shadow-md",
                                },
                            }}
                        />
                    </DropdownItem>
                    <DropdownItem key="settings" href="/settings" className="title-small" startContent={<Settings strokeWidth={1.5} className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />}>
                        設定
                    </DropdownItem>
                    <DropdownItem key="logout" color="danger" onPress={handleSignOut} className="title-small text-[var(--md-sys-color-error)]" startContent={<LogOut strokeWidth={1.5} className="w-5 h-5" />}>
                        ログアウト
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </header>
    );
}
