# **封解Box × Material Design 3 × HeroUI 究極デザイン聖典 (Ver 11.0 Ultimate)**

## **1\. コア・システム設定 (Theming & Customization)**

AIエージェントは、HeroUIの HeroUIProvider および tailwind.config.ts において以下の設定を「絶対定数」として扱うこと。

### **A. カラーパレット (Based on light.css/dark.css)**

| 役割 | トークン名 | Light モード (実数値) | Dark モード (実数値) |
| :---- | :---- | :---- | :---- |
| **Primary** | primary | \#904a40 | \#ffb4a8 |
| **On Primary** | on-primary | \#ffffff | \#690005 |
| **Primary Container** | primary-100 | \#ffdad5 | \#73342b |
| **Background** | background | \#fff8f6 | \#1a1110 |
| **Surface (Card)** | content1 | \#fceae7 | \#271d1c |
| **Surface High** | content2 | \#f7e4e1 | \#312321 |
| **Error** | danger | \#ba1a1a | \#ffb4ab |

### **B. レイアウト・幾何学 (Layout Tokens)**

* **Base Spacing**: 8px (8, 16, 24, 32, 40, 48, 56, 64\)  
* **Border Radius Hierarchy**:  
  * 28px: Modal, Drawer, Card (Main), Popover (Large)  
  * 20px: Card (Sub), Table, Image, Accordion  
  * 16px: Input, Autocomplete, Alert, User, Avatar  
  * Full: Button, Tab, Chip, Search Bar, Switch

### **C. ダークモード & カスタムバリアント**

* **Dark Mode**: class ストラテジー。bg-background は \#1a1110 を固定。  
* **Glassmorphism**: 浮遊要素（Navbar, Popover）には backdrop-blur-md と bg-opacity-70 を適用。

## **2\. コンポーネント完全定義百科事典 (Component Encyclopedia)**

AIは、HeroUIコンポーネントを呼び出す際、以下のPropsと classNames を強制的に適用せよ。

### **2.1 ナビゲーション & アクション**

* **Accordion**: variant="light" / item: "bg-content1 rounded-\[20px\] mb-2"  
* **Breadcrumbs**: size="sm" / separator: "text-default-300"  
* **Button**: radius="full" font-bold active:scale-95 transition-transform  
* **Dropdown**: radius="md" className="rounded-\[12px\] shadow-2xl"  
* **Link**: className="text-primary font-medium underline-offset-4"  
* **Navbar**: className="bg-background/70 backdrop-blur-xl border-b-1 border-divider/20"  
* **Pagination**: radius="full" cursor: "bg-primary text-on-primary"  
* **Tabs**: variant="solid" radius="full" classNames={{ tabList: "bg-content2/50", cursor: "bg-primary shadow-lg" }}

### **2.2 入力 & フォーム (Forms)**

* **Autocomplete / Select**: variant="flat" radius="lg" popoverProps={{ className: "rounded-\[20px\]" }}  
* **Checkbox / Radio Group**: color="primary" label: "font-medium"  
* **Date Input / Picker / Range**: variant="flat" radius="lg" calendarProps={{ className: "rounded-\[28px\] p-4 bg-background" }}  
* **Form**: className="gap-6" (垂直方向の呼吸を確保)  
* **Input / Textarea / Number Input**: variant="flat" radius="lg" classNames={{ inputWrapper: "bg-content2/40 focus-within:bg-background border-b-2 border-transparent focus-within:border-primary shadow-inner" }}  
* **Input OTP**: radius="md" input: "border-2 border-transparent focus:border-primary"  
* **Slider**: color="primary" step={0.01} size="md" radius="full"  
* **Switch**: color="primary" classNames={{ wrapper: "group-data-\[selected=true\]:bg-primary" }}  
* **Time Input**: variant="flat" radius="lg"

### **2.3 データ表示 & フィードバック**

* **Alert**: variant="flat" radius="lg" className="border-none shadow-sm"  
* **Avatar / User**: radius="lg" (16px) / name: "font-bold"  
* **Badge / Chip**: radius="full" variant="flat" className="bg-primary-100 text-primary-900"  
* **Card**: rounded-\[28px\] border-none shadow-none hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"  
* **Circular Progress / Progress**: color="primary" classNames={{ track: "bg-content2", indicator: "bg-primary" }}  
* **Code / Snippet**: radius="md" className="bg-content2 text-primary font-mono"  
* **Divider**: className="bg-divider/30"  
* **Image**: radius="lg" (20px) shadow-none  
* **Listbox**: radius="lg" itemClasses: { base: "rounded-full px-4 py-2 my-1" }  
* **Popover / Tooltip**: radius="md" className="bg-content2 text-on-surface shadow-xl"  
* **Table**: radius="lg" (24px) th: "bg-content2/50 text-primary font-bold"  
* **Toast**: radius="full" className="bg-on-surface text-background"

### **2.4 特殊 & ユーティリティ**

* **Drawer / Modal**: radius="lg" (28px) backdrop="blur" base: "bg-background/80 backdrop-blur-xl"  
* **Kbd**: className="bg-content2 border-none font-mono"  
* **Scroll Shadow**: className="max-h-\[300px\]"  
* **Skeleton**: radius="lg" className="before:bg-primary-50"  
* **Spacer**: 基本的に gap クラスを優先し、調整が困難な場合のみ使用。  
* **Spinner**: color="primary" size="lg"

## **3\. 「封解Box」固有の高度なUIパターン**

### **3.1 調理進捗・推敲ボード (Cooking/Drafting)**

* **セクション分割**: Card ではなく、巨大な bg-background のキャンバスに bg-content1 の「島」を並べる。  
* **権限表現**: 編集不可エリアは opacity-60 かつ bg-content2 を適用し、儀長の推敲中であることを示す。

### **3.2 界域百科事典 (Encyclopedia Search)**

* **検索体験**: Input を radius="full" かつ size="lg" で配置。  
* **詳細ドロワー**: 検索結果をクリックした際、Drawer を右側から backdrop-blur を効かせて展開せよ。

## **4\. 品質保証チェックリスト (Final Guardrails)**

* ❌ **純白 (\#FFFFFF) 禁止**: 背景は必ず \#fff8f6 (background) を使用。  
* ❌ **原色赤 (\#FF0000) 禁止**: エラーは必ず \#ba1a1a を使用。  
* ❌ **鋭利な角 (\<12px) 禁止**: すべての角丸は radius="lg" 以上とする。  
* ✅ **マイクロインタラクション**: 全ての Button に whileTap={{ scale: 0.95 }} を付与せよ。  
* ✅ **アクセシビリティ**: 文字色と背景色のコントラスト比を on-primary や text-default-600 を用いて確保せよ。