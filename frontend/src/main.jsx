import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import jaJP from 'antd/locale/ja_JP'
import './index.css'
import App from './App.jsx'

// FukaiBox - 和モダンデザインシステム
const fukaiBoxTheme = {
  token: {
    // Brand Colors - 茜色と生成り
    colorPrimary: '#B3424A',          // 茜色 - Primary
    colorPrimaryBg: 'rgba(179, 66, 74, 0.08)',
    colorPrimaryBgHover: 'rgba(179, 66, 74, 0.12)',
    colorPrimaryBorder: 'rgba(179, 66, 74, 0.3)',
    colorPrimaryHover: '#9e2b1f',     // 深緋 - Darker
    colorPrimaryActive: '#852318',

    // Surface & Background
    colorBgContainer: '#FFFFFF',      // 白 - Cards
    colorBgLayout: '#fdfaf5',         // 生成り - Base background
    colorBgElevated: '#FFFFFF',
    colorTextBase: '#121212',         // 墨色 - Primary text
    colorTextSecondary: 'rgba(18, 18, 18, 0.6)',
    colorTextTertiary: 'rgba(18, 18, 18, 0.38)',

    // Borders
    colorBorder: 'rgba(18, 18, 18, 0.08)',
    colorBorderSecondary: 'rgba(18, 18, 18, 0.06)',

    // Shape - Rounded
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,

    // Typography - Noto Sans JP
    fontFamily: '"Noto Sans JP", sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,

    // Shadows - Subtle
    boxShadow: '0 1px 3px rgba(18, 18, 18, 0.08)',
    boxShadowSecondary: '0 4px 12px rgba(18, 18, 18, 0.1)',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#fdfaf5',
      siderBg: '#FFFFFF',
      triggerBg: '#B3424A',
      triggerColor: '#FFFFFF',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#B3424A',
      itemSelectedColor: '#FFFFFF',
      itemHoverBg: 'rgba(18, 18, 18, 0.08)',
      itemActiveBg: 'rgba(179, 66, 74, 0.12)',
      itemColor: '#121212',
      iconSize: 20,
      itemHeight: 48,
      itemMarginInline: 4,
      itemBorderRadius: 100,
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      boxShadowTertiary: '0 1px 3px rgba(18, 18, 18, 0.08)',
    },
    Button: {
      primaryColor: '#FFFFFF',
      colorPrimary: '#B3424A',
      algorithm: true,
      controlHeight: 40,
      controlHeightLG: 48,
      borderRadius: 100,
      fontWeight: 500,
    },
    Table: {
      headerBg: '#FFFFFF',
      headerColor: '#121212',
      rowHoverBg: 'rgba(18, 18, 18, 0.04)',
    },
    Input: {
      activeBorderColor: '#B3424A',
      hoverBorderColor: 'rgba(18, 18, 18, 0.38)',
      borderRadius: 8,
      controlHeight: 48,
    },
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={fukaiBoxTheme} locale={jaJP}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
