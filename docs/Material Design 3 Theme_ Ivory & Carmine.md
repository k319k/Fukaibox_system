# **Material Design 3 Theme Definition**

このテーマは、ベースカラーに温かみのあるアイボリー（#F5F0DC）、アクセントに力強い赤（#B3424A, #9E2B1F）を採用した、高級感と親しみやすさを両立させた配色です。

## **🎨 カラーパレット概要 (Color Schemes)**

### **1. Light Scheme (ライトモード)**

背景に #F5F0DC を使用し、テキストや境界線に温かみのある暗色を配しています。

| Role | Color Code | Description |
| :---- | :---- | :---- |
| **Primary** | #B3424A | メインのアクセント。ボタンや選択状態に使用。 |
| **On Primary** | #FFFFFF | Primaryの上に乗るテキスト色。 |
| **Primary Container** | #FFDAD9 | カードや入力フィールドの背景など、控えめな強調。 |
| **Secondary** | #9E2B1F | 第2のアクセント。より深刻な、または深い強調。 |
| **Tertiary** | #775930 | 補完色（茶系）。視覚的なバランスを整えます。 |
| **Surface** | #F5F0DC | **ご指定のベースカラー**。アプリ全体の背景。 |
| **On Surface** | #1D1B16 | 背景の上に乗るメインのテキスト色。 |
| **Outline** | #857372 | 境界線や枠線。 |

### **2. Dark Scheme (ダークモード)**

コントラストを抑え、目に優しい深い茶褐色をベースとしています。

| Role | Color Code | Description |
| :---- | :---- | :---- |
| **Primary** | #FFB3B3 | ダークモード用に明度を上げた赤。 |
| **On Primary** | #680016 | 暗いPrimaryの上に乗るテキスト色。 |
| **Surface** | #1D1B16 | 深い暗褐色。アイボリーの補色的な暗色。 |
| **On Surface** | #EBE1D4 | ダーク背景の上に乗る明るいテキスト色。 |

---

## **💡 オフホワイトパレット（純白を避けた目に優しい白）**

メイン背景のアイボリー（#F5F0DC）に馴染みつつ、画面を引き締める色味です。

| カラー名称 | Hex コード | 特徴・使い分け |
| :---- | :---- | :---- |
| **Milky White** | #FFFBF2 | アイボリーを極限まで薄くした色。**サイドバーに使用**すると、メイン画面との繋がりが非常にスムーズになります。 |
| **Snow White (Soft)** | #FAF9F6 | わずかにグレーとベージュが混ざった、紙のような質感の白。高級感を出したい時に最適です。 |
| **Eggshell** | #FDFBF0 | 卵の殻のような、最もM3の「Ivory & Carmine」テーマに調和するオフホワイトです。**カード背景に使用**。 |

### **M3としての実装のコツ**

- **階層の表現**: これらの色を `surface-container-lowest` として定義します。
- **影の馴染ませ**: サイドバーに影を落とす場合は、純粋な黒（#000000）ではなく、メインのテキスト色である #1D1B16 を混ぜた透過色（例: `rgba(29, 27, 22, 0.05)`）を使うと、白浮きせず美しく見えます。

### **🛠️ おすすめの組み合わせ**

今のUIを洗練させるなら、以下のバランスが「ダサさ」を払拭する最短ルートです。

| 用途 | カラー |
| :---- | :---- |
| サイドバー背景 | #FFFBF2（Milky White） |
| メイン背景 | #F5F0DC（Ivory） |
| カード背景 | #FDFBF0（Eggshell） |
| 選択項目インジケーター | #FFDAD9（Primary Container） |
| 枠線（Outline） | #857372（必要な箇所にだけ、ごく細く） |

---

## **💻 実装用コード (Implementation)**

### **CSS Variables (Tokens)**

Web開発（React/Vue/HTML）でそのまま使用できる変数定義です。

```css
:root {
  /* Primary */
  --md-sys-color-primary: #B3424A;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #FFDAD9;
  --md-sys-color-on-primary-container: #40000A;
  
  /* Secondary */
  --md-sys-color-secondary: #9E2B1F;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #FFDAD4;
  --md-sys-color-on-secondary-container: #400001;
  
  /* Tertiary */
  --md-sys-color-tertiary: #775930;
  --md-sys-color-on-tertiary: #FFFFFF;
  --md-sys-color-tertiary-container: #FFDEBC;
  --md-sys-color-on-tertiary-container: #291800;
  
  /* Surface Hierarchy (Off-White Palette) */
  --md-sys-color-surface: #F5F0DC;                    /* Ivory - メイン背景 */
  --md-sys-color-surface-container-lowest: #FDFBF0;   /* Eggshell - カード */
  --md-sys-color-surface-container-low: #FAF9F6;      /* Snow White */
  --md-sys-color-surface-container: #F5F0DC;          /* Ivory - 標準 */
  --md-sys-color-surface-container-high: #EFEAD8;
  --md-sys-color-surface-container-highest: #E6E1CE;
  --md-sys-color-sidebar: #FFFBF2;                    /* Milky White */
  --md-sys-color-on-surface: #1D1B16;
  --md-sys-color-on-surface-variant: #4B4639;
  --md-sys-color-surface-variant: #E8E1CF;
  
  /* Outline */
  --md-sys-color-outline: #857372;
  --md-sys-color-outline-variant: #CCC6B5;
}
```

### **JSON Format (Design Tokens)**

Figmaのプラグインや、独自のテーマエンジンに読み込める形式です。

```json
{
  "schemes": {
    "light": {
      "primary": "#B3424A",
      "onPrimary": "#FFFFFF",
      "primaryContainer": "#FFDAD9",
      "secondary": "#9E2B1F",
      "tertiary": "#775930",
      "surface": "#F5F0DC",
      "sidebar": "#FFFBF2",
      "surfaceContainerLowest": "#FDFBF0",
      "onSurface": "#1D1B16"
    }
  }
}
```

---

## **🛠️ デザインのポイント**

1. **アイボリーの活用**: Surface に #F5F0DC を設定しているため、真っ白な画面よりも柔らかく、紙のような質感を演出できます。
2. **オフホワイトの階層**: 純白（#FFFFFF）を避け、Milky White / Eggshell / Snow White で階層を表現。目に優しく、高級感があります。
3. **アクセントの使い分け**: Primary (#B3424A) は能動的なアクション（保存、送信など）に、Secondary (#9E2B1F) は静的な強調（見出し、重要なバッジなど）に使うと、画面内の階層が整理されます。
4. **コントラスト**: アイボリー背景上の黒い文字（On Surface）は非常に読みやすいですが、赤系のアクセントを使用する際は、アクセシビリティ確保のため Primary Container などの薄い色を背景に敷くことを推奨します。
5. **影の調和**: 影には `rgba(29, 27, 22, 0.05)` を使用し、純粋な黒ではなくテーマに馴染む暖色系の影を適用します。

*注: このカラーパレットは Material Design 3 の色生成アルゴリズム（HCT色空間）に基づき計算していますが、実際のレンダリング環境により見え方が多少異なる場合があります。*
