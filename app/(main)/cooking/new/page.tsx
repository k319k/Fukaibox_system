import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// 新規作成は一覧ページのモーダルで行うため、リダイレクト
export default function NewKitchenPage() {
    redirect('/cooking');
}
