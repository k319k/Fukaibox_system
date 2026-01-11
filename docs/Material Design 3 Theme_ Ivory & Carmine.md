# **Material Design 3 Theme Definition**

このテーマは、ベースカラーに温かみのあるアイボリー（\#F5F0DC）、アクセントに力強い赤（\#B3424A, \#9E2B1F）を採用した、高級感と親しみやすさを両立させた配色です。

## **🎨 カラーパレット概要 (Color Schemes)**

### **1\. Light Scheme (ライトモード)**

背景に \#F5F0DC を使用し、テキストや境界線に温かみのある暗色を配しています。

| Role | Color Code | Description |
| :---- | :---- | :---- |
| **Primary** | \#B3424A | メインのアクセント。ボタンや選択状態に使用。 |
| **On Primary** | \#FFFFFF | Primaryの上に乗るテキスト色。 |
| **Primary Container** | \#FFDAD9 | カードや入力フィールドの背景など、控えめな強調。 |
| **Secondary** | \#9E2B1F | 第2のアクセント。より深刻な、または深い強調。 |
| **Tertiary** | \#775930 | 補完色（茶系）。視覚的なバランスを整えます。 |
| **Surface** | \#F5F0DC | **ご指定のベースカラー**。アプリ全体の背景。 |
| **On Surface** | \#1D1B16 | 背景の上に乗るメインのテキスト色。 |
| **Outline** | \#857372 | 境界線や枠線。 |

### **2\. Dark Scheme (ダークモード)**

コントラストを抑え、目に優しい深い茶褐色をベースとしています。

| Role | Color Code | Description |
| :---- | :---- | :---- |
| **Primary** | \#FFB3B3 | ダークモード用に明度を上げた赤。 |
| **On Primary** | \#680016 | 暗いPrimaryの上に乗るテキスト色。 |
| **Surface** | \#1D1B16 | 深い暗褐色。アイボリーの補色的な暗色。 |
| **On Surface** | \#EBE1D4 | ダーク背景の上に乗る明るいテキスト色。 |

## **💻 実装用コード (Implementation)**

### **CSS Variables (Tokens)**

Web開発（React/Vue/HTML）でそのまま使用できる変数定義です。

:root {  
  \--md-sys-color-primary: \#B3424A;  
  \--md-sys-color-on-primary: \#FFFFFF;  
  \--md-sys-color-primary-container: \#FFDAD9;  
  \--md-sys-color-on-primary-container: \#40000A;  
    
  \--md-sys-color-secondary: \#9E2B1F;  
  \--md-sys-color-on-secondary: \#FFFFFF;  
  \--md-sys-color-secondary-container: \#FFDAD4;  
  \--md-sys-color-on-secondary-container: \#400001;  
    
  \--md-sys-color-surface: \#F5F0DC;  
  \--md-sys-color-on-surface: \#1D1B16;  
  \--md-sys-color-surface-variant: \#F4DDDB;  
  \--md-sys-color-on-surface-variant: \#534342;  
    
  \--md-sys-color-outline: \#857372;  
}

### **JSON Format (Design Tokens)**

Figmaのプラグインや、独自のテーマエンジンに読み込める形式です。

{  
  "schemes": {  
    "light": {  
      "primary": "\#B3424A",  
      "onPrimary": "\#FFFFFF",  
      "primaryContainer": "\#FFDAD9",  
      "secondary": "\#9E2B1F",  
      "tertiary": "\#775930",  
      "surface": "\#F5F0DC",  
      "onSurface": "\#1D1B16"  
    }  
  }  
}

## **🛠️ デザインのポイント**

1. **アイボリーの活用**: Surface に \#F5F0DC を設定しているため、真っ白な画面よりも柔らかく、紙のような質感を演出できます。  
2. **アクセントの使い分け**: Primary (\#B3424A) は能動的なアクション（保存、送信など）に、Secondary (\#9E2B1F) は静的な強調（見出し、重要なバッジなど）に使うと、画面内の階層が整理されます。  
3. **コントラスト**: アイボリー背景上の黒い文字（On Surface）は非常に読みやすいですが、赤系のアクセントを使用する際は、アクセシビリティ確保のため Primary Container などの薄い色を背景に敷くことを推奨します。

*注: このカラーパレットは Material Design 3 の色生成アルゴリズム（HCT色空間）に基づき計算していますが、実際のレンダリング環境により見え方が多少異なる場合があります。*