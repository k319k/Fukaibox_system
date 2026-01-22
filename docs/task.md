# Material Design 3 (M3) Refinement Plan

## Goal

Make the UI strictly follow Material Design 3 guidelines based on user feedback.

## Specific Actions

### 1. Global Theme Updates (ConfigProvider)

- [ ] **Corner Radius**: Update `borderRadiusLG` to 16px (from 28px/20px). Mobile/small cards to 12px.
- [ ] **Colors**: Ensure clear distinction between `colorBgLayout` (Surface), `colorBgContainer` (Surface Container), `colorBgElevated` (Surface Container High).
- [ ] **Shadows**: Remove generic shadows. Use surface colors for separation.
- [ ] **Typography**: Apply proper line heights and weights.

### 2. Layout & Navigation

- [ ] **Sidebar**: Add divider. Show standard selection state (Pill shape indicator).
- [ ] **Hierarchy**: Ensure background is lowest luminance (or compliant with M3 dark/light scheme). Using `var(--md-sys-color-surface)` vs `var(--md-sys-color-surface-container)`.

### 3. Component Refinement

- [ ] **Buttons**: Ensure full rounded (Capsule/Pill) for buttons, smaller rounded (Rounded Rect) for cards.
- [ ] **Cards**: Remove `box-shadow`, use background colors (`bg-surface-container-low` etc).
- [ ] **Empty States**: Add illustrations/icons for empty data.
- [ ] **Grid**: Verify 8dp spacing (gap-2, gap-4, gap-6, p-4, p-6).

### 4. Code & Build

- [ ] Refactor repetitive styles.
- [ ] Verify build.
- [ ] Push to GitHub.

## Refinement Loop

Apply changes -> Review -> Fix (PDCA)
