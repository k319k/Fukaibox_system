import { redirect } from "next/navigation";

// 新規作成は一覧ページのモーダルで行うため、リダイレクト
export default function NewKitchenPage() {
    redirect('/cooking');
}
