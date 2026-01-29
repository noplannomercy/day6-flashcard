# Flash Card App - Design System

> Stitch 프로젝트에서 추출한 디자인 컨텍스트
> Project ID: `4342167786631514205`
> Screen ID: `3330c3b007e748e29d4f58deab4bddf4`

## Color Palette

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Primary (Mint)** | `#13b499` | rgb(19, 180, 153) | 주요 액션, 강조, Got it 버튼 |
| **Primary Hover** | `#16cbb0` | rgb(22, 203, 176) | Primary 호버 상태 |

### Background Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Background Dark** | `#11211e` | rgb(17, 33, 30) | 메인 배경 |
| **Card Dark** | `#1a2c29` | rgb(26, 44, 41) | 카드, 입력 필드 배경 |
| **Surface** | `#244741` | rgb(36, 71, 65) | 버튼, 배지 배경 |
| **Surface Hover** | `#2f5a52` | rgb(47, 90, 82) | Surface 호버 상태 |
| **Card Hover** | `#1e3430` | rgb(30, 52, 48) | 카드 호버 상태 |

### Text Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **White** | `#ffffff` | rgb(255, 255, 255) | 주요 텍스트 |
| **Muted** | `#93c8bf` | rgb(147, 200, 191) | 보조 텍스트, 아이콘 |
| **Subtle** | `#5d7f79` | rgb(93, 127, 121) | 플레이스홀더, 힌트 |

### Accent Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Coral (Review)** | `#fb7185` | rgb(251, 113, 133) | Review 버튼, 오답 표시 |
| **Yellow** | `yellow-400` | - | 즐겨찾기 아이콘 호버 |

### Border Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Border Default** | `#244741` | 구분선, 입력 필드 테두리 |
| **Border Hover** | `#34655d` | 입력 필드 호버 |

## Typography

### Font Family
```css
font-family: 'Inter', sans-serif;
```

Google Fonts CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
```

### Font Weights
| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | 본문 텍스트 |
| Medium | 500 | 보조 텍스트 |
| Semibold | 600 | 레이블 |
| Bold | 700 | 제목, 버튼 |
| Extrabold | 800 | 카드 메인 텍스트 |

### Font Sizes
| Size | Class | Usage |
|------|-------|-------|
| 12px | `text-xs` | 키보드 단축키, 태그 |
| 14px | `text-sm` | 버튼, 입력 필드 |
| 16px | `text-base` | 본문 |
| 18px | `text-lg` | 앱 타이틀 |
| 20px | `text-xl` | 카드 번호 |
| 48px | `text-5xl` | 카드 콘텐츠 (모바일) |
| 72px | `text-7xl` | 카드 콘텐츠 (데스크탑) |

### Text Styles
```css
/* 앱 타이틀 */
.app-title {
  font-size: 1.125rem;    /* text-lg */
  font-weight: 700;       /* font-bold */
  letter-spacing: -0.025em; /* tracking-tight */
}

/* 섹션 레이블 */
.section-label {
  font-size: 0.75rem;     /* text-xs */
  font-weight: 600;       /* font-semibold */
  letter-spacing: 0.1em;  /* tracking-widest */
  text-transform: uppercase;
}

/* 카드 메인 텍스트 */
.card-text {
  font-size: 4.5rem;      /* text-7xl */
  font-weight: 800;       /* font-extrabold */
  letter-spacing: -0.025em; /* tracking-tight */
  line-height: 1.25;      /* leading-tight */
}
```

## Spacing System

### Base Unit
Tailwind 기본 단위 사용 (4px = 1 unit)

### Common Spacings
| Size | Pixels | Usage |
|------|--------|-------|
| `gap-1` | 4px | 아이콘과 텍스트 |
| `gap-2` | 8px | 인라인 요소 간격 |
| `gap-3` | 12px | 컴포넌트 내부 |
| `gap-4` | 16px | 버튼 그리드 |
| `gap-6` | 24px | 카드 내부 콘텐츠 |
| `gap-8` | 32px | 섹션 간 간격 |
| `p-4` | 16px | 모바일 패딩 |
| `p-6` | 24px | 헤더 패딩 |
| `p-8` | 32px | 카드 내부 패딩 |
| `px-3` | 12px | 배지, 태그 |
| `py-2.5` | 10px | 입력 필드 |

## Border Radius

| Size | Pixels | Usage |
|------|--------|-------|
| `rounded` | 4px | 키보드 단축키 |
| `rounded-lg` | 8px | 로고, 입력 필드, 버튼 |
| `rounded-xl` | 12px | 액션 버튼 |
| `rounded-2xl` | 16px | 플래시카드 |
| `rounded-full` | 9999px | 아바타, 원형 버튼, 태그 |

## Shadows

```css
/* 카드 기본 그림자 */
.card-shadow {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  /* shadow-2xl shadow-black/40 */
}

/* 카드 호버 그림자 */
.card-shadow-hover {
  box-shadow: 0 25px 50px -12px rgba(19, 180, 153, 0.1);
  /* hover:shadow-primary/10 */
}

/* Got it 버튼 호버 글로우 */
.button-glow {
  box-shadow: 0 0 20px rgba(19, 180, 153, 0.3);
}

/* 프로그레스바 글로우 */
.progress-glow {
  box-shadow: 0 0 10px rgba(19, 180, 153, 0.6);
}
```

## Components

### Header
```html
<header class="flex items-center justify-between border-b border-[#244741] px-6 py-4 bg-background-dark sticky top-0 z-50">
```
- 높이: 자동 (패딩 기반)
- 배경: `#11211e`
- 하단 보더: `#244741`
- Sticky 포지션

### Flashcard
```html
<!-- Gradient Border Wrapper -->
<div class="gradient-border-wrapper p-[2px] rounded-[1.1rem]">
  <div class="w-full aspect-[1.5/1] min-h-[360px] md:min-h-[420px] bg-[#1a2c29] rounded-2xl">
    <!-- Content -->
  </div>
</div>
```
- 비율: 1.5:1
- 최소 높이: 360px (모바일), 420px (데스크탑)
- 그라데이션 보더 애니메이션

### Buttons

#### Primary Button (Got it!)
```html
<button class="h-14 rounded-xl bg-primary text-[#11221f] font-bold hover:bg-[#16cbb0] hover:shadow-[0_0_20px_rgba(19,180,153,0.3)]">
```

#### Secondary Button (Review)
```html
<button class="h-14 rounded-xl bg-coral/10 border border-coral/20 text-coral font-bold hover:bg-coral hover:text-white">
```

#### Navigation Button
```html
<button class="h-14 rounded-xl bg-[#244741] text-white hover:bg-[#2f5a52]">
```

#### Icon Button
```html
<button class="size-10 rounded-full bg-[#1a2c29] flex items-center justify-center text-[#93c8bf] hover:bg-[#244741] hover:text-white">
```

### Input Field
```html
<input class="w-full rounded-lg border-0 bg-[#1a2c29] py-2.5 pl-10 pr-3 text-white placeholder:text-[#5d7f79] ring-1 ring-inset ring-[#244741] focus:ring-2 focus:ring-primary" />
```

### Badge
```html
<div class="h-9 rounded-lg bg-[#244741] px-3 flex items-center gap-x-2">
  <span class="material-symbols-outlined text-primary">style</span>
  <p class="text-white text-sm font-medium">15 cards</p>
</div>
```

### Tag/Chip
```html
<span class="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
  Phrase
</span>
```

### Progress Bar
```html
<div class="fixed bottom-0 left-0 w-full h-1.5 bg-[#1a2c29]">
  <div class="h-full bg-primary shadow-[0_0_10px_rgba(19,180,153,0.6)]" style="width: 20%"></div>
</div>
```

## Animations

### Shimmer (Gradient Border)
```css
@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.gradient-border-wrapper {
  background: linear-gradient(60deg,
    rgba(19, 180, 153, 0.1),
    rgba(19, 180, 153, 0.4),
    rgba(19, 180, 153, 0.1)
  );
  background-size: 200% 200%;
  animation: shimmer 3s linear infinite;
}
```

### Hover Scale
```css
.card-content {
  transform: scale(1);
  transition: transform 300ms;
}
.card:hover .card-content {
  transform: scale(1.05);
}
```

### Button Arrow Slide
```css
.nav-button:hover .arrow-icon {
  transform: translateX(4px); /* or -4px for left */
  transition: transform 150ms;
}
```

### Bounce (Touch Hint)
```css
/* Tailwind animate-bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
```

### Transitions
```css
/* 기본 트랜지션 */
transition: all 150ms;           /* transition-all */
transition: colors 150ms;        /* transition-colors */
transition: opacity 300ms;       /* transition-opacity duration-300 */
transition: shadow 500ms;        /* transition-shadow duration-500 */
transition: transform 300ms;     /* transition-transform duration-300 */
```

## Icons

### Material Symbols (Outlined)
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Icon Usage
| Icon | Name | Usage |
|------|------|-------|
| school | 앱 로고 |
| folder | 덱 선택 |
| search | 검색 |
| expand_more | 드롭다운 화살표 |
| style | 카드 아이콘 |
| settings | 설정 |
| star | 즐겨찾기 |
| volume_up | 오디오 재생 |
| touch_app | 탭 힌트 |
| arrow_back | 이전 |
| arrow_forward | 다음 |
| refresh | 리뷰/다시보기 |
| check | 완료/정답 |

### Icon Sizes
| Size | Pixels | Usage |
|------|--------|-------|
| `text-[18px]` | 18px | 배지 내 아이콘 |
| `text-[20px]` | 20px | 입력 필드 아이콘 |
| `text-xl` | 20px | 로고 아이콘 |
| 기본 (24px) | 24px | 버튼 아이콘 |

## Responsive Breakpoints

### Tailwind Breakpoints
| Prefix | Min Width | Usage |
|--------|-----------|-------|
| (none) | 0px | 모바일 기본 |
| `sm` | 640px | 작은 태블릿 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 데스크탑 |

### Responsive Patterns
```html
<!-- 모바일에서 숨김 -->
<h1 class="hidden sm:block">Flash Cards</h1>

<!-- 모바일에서 작은 폰트 -->
<p class="text-5xl md:text-7xl">こんにちは</p>

<!-- 모바일에서 숨김 (아이콘) -->
<span class="material-symbols-outlined hidden md:block">check</span>

<!-- 모바일에서 다른 패딩 -->
<main class="p-4 md:p-8">
```

## Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #11211e;
}
::-webkit-scrollbar-thumb {
  background: #244741;
  border-radius: 4px;
}
```

## Tailwind Config

```javascript
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#13b499",
        "background-light": "#f6f8f8",
        "background-dark": "#11211e",
        "card-dark": "#1a2c29",
        "coral": "#fb7185",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
    },
  },
}
```

## CSS Variables (Optional)

기존 프로젝트에 통합 시 CSS 변수로 변환:

```css
:root {
  /* Primary */
  --color-primary: #13b499;
  --color-primary-hover: #16cbb0;

  /* Backgrounds */
  --color-bg-dark: #11211e;
  --color-bg-card: #1a2c29;
  --color-bg-surface: #244741;
  --color-bg-surface-hover: #2f5a52;

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-muted: #93c8bf;
  --color-text-subtle: #5d7f79;

  /* Accent */
  --color-coral: #fb7185;

  /* Border */
  --color-border: #244741;

  /* Spacing */
  --spacing-unit: 4px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

## Accessibility

### Focus States
```css
/* 포커스 링 */
focus:ring-2 focus:ring-primary/50
focus:ring-2 focus:ring-coral/50

/* 아웃라인 제거 (링으로 대체) */
outline-none
```

### Touch Targets
- 최소 터치 영역: 44px x 44px
- 버튼 높이: `h-14` (56px)
- 아이콘 버튼: `size-10` (40px) - 패딩 포함 시 44px+

### Text Selection
```css
selection:bg-primary/30
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .gradient-border-wrapper {
    animation: none;
  }
}
```

---

## Quick Reference

### 자주 사용하는 클래스 조합

```html
<!-- 카드 배경 -->
class="bg-[#1a2c29] rounded-2xl"

<!-- Primary 버튼 -->
class="bg-primary text-[#11221f] font-bold rounded-xl h-14 hover:bg-[#16cbb0]"

<!-- Secondary 버튼 -->
class="bg-[#244741] text-white rounded-xl h-14 hover:bg-[#2f5a52]"

<!-- 입력 필드 -->
class="bg-[#1a2c29] rounded-lg ring-1 ring-[#244741] focus:ring-2 focus:ring-primary py-2.5 px-3"

<!-- 보조 텍스트 -->
class="text-[#93c8bf] text-sm"

<!-- 힌트 텍스트 -->
class="text-[#5d7f79] text-xs"
```

---

*Generated from Stitch Project: Flash Card Learning App*
*Last Updated: 2026-01-29*
