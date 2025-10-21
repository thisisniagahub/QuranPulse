# 💚💙 QuranPulse - Design System & Branding Guide

**Tagline:** "Follow the pulse of the Quran"  
**Version:** 2.0.0

---

## 🎨 Visual Identity

### Logo Concept

**QuranPulse Logo** terdiri daripada:
1. **Teks "QuranPulse"** dalam font Poppins Bold
2. **Ikon Gelombang Nadi** berbentuk huruf **Q** 
3. **Aura Cahaya** spiritual pulse di sekeliling logo

```
   ╭─────────────────────────╮
   │    ∿∿∿   QuranPulse     │  ← Gelombang nadi sebagai huruf Q
   │   (pulse wave Q shape)   │
   │   dengan glow effect     │
   ╰─────────────────────────╯
```

### Logo Variations

**Primary Logo** - Full color gradient
- Text: "QuranPulse" with gradient fill
- Icon: Pulse wave Q with glow effect
- Colors: Gradient dari #0f5132 → #0dcaf0

**Secondary Logo** - Monochrome
- Text: "QuranPulse" in white/dark
- Icon: Simplified pulse wave
- Use: Pada background dengan contrast rendah

**Icon Only** - App Icon
- Pulse wave Q shape
- Background: Dark green #0f5132
- Foreground: Cyan accent #0dcaf0
- Glow: Subtle radial gradient

---

## 🌈 Color Palette

### Primary Colors

**Brand Gradient** - Spiritual Journey
```
Hijau Tua → Biru Cyan
#0f5132   →  #0dcaf0
(Dark Green)  (Cyan Blue)

Makna: Perjalanan dari ketenangan (hijau) ke pencerahan (biru)
```

#### Hijau (Primary)
- **Main:** `#0f5132` - Dark Green (Ketenangan, spiritual)
- **Light:** `#198754` - Green Accent
- **Lighter:** `#10B981` - Success states

#### Biru Cyan (Secondary)  
- **Main:** `#0dcaf0` - Cyan Blue (Pencerahan, guidance)
- **Dark:** `#0891b2` - Dark Cyan
- **Lighter:** `#22d3ee` - Bright cyan highlights

### Semantic Colors

**Success:** `#10B981` - Emerald Green  
**Warning:** `#F59E0B` - Amber (untuk bookmarks)  
**Error:** `#EF4444` - Red  
**Info:** `#3B82F6` - Blue

### Background Colors (Dark Mode)

**Primary:** `#111827` - Deep Dark Gray  
**Secondary:** `#1F2937` - Card Background  
**Tertiary:** `#374151` - Elevated Surfaces

### Text Colors

**Primary Text:** `#FFFFFF` - White  
**Secondary Text:** `#D1D5DB` - Light Gray  
**Tertiary Text:** `#9CA3AF` - Muted Gray  
**Accent Text:** `#0dcaf0` - Cyan Blue

---

## ✍️ Typography System

### Font Families

**Moden Sans (Poppins)**
```
Poppins-Thin         (100) - Decorative
Poppins-Light        (300) - Body light
Poppins-Regular      (400) - Body text
Poppins-Medium       (500) - Emphasis
Poppins-SemiBold     (600) - Subheadings
Poppins-Bold         (700) - Headings
Poppins-ExtraBold    (800) - Titles
```

**Islamik Serif (Amiri)**
```
Amiri-Regular        - Quran text
Amiri-Bold           - Quran headings
Amiri-Italic         - Transliteration
Amiri-BoldItalic     - Special emphasis
```

### Typography Scale

**Display (Brand)**
- Font: Poppins ExtraBold
- Size: 48px / 3rem
- Use: Splash screen, onboarding
- Color: Gradient (#0f5132 → #0dcaf0)

**H1 (Page Titles)**
- Font: Poppins Bold
- Size: 32px / 2rem
- Line Height: 40px
- Color: #FFFFFF

**H2 (Section Headers)**
- Font: Poppins Bold
- Size: 28px / 1.75rem
- Line Height: 36px
- Color: #FFFFFF

**H3 (Subsections)**
- Font: Poppins SemiBold
- Size: 24px / 1.5rem
- Line Height: 32px
- Color: #FFFFFF

**H4 (Card Titles)**
- Font: Poppins SemiBold
- Size: 20px / 1.25rem
- Line Height: 28px
- Color: #FFFFFF

**Body Text**
- Font: Poppins Regular
- Size: 16px / 1rem
- Line Height: 24px (1.5)
- Color: #FFFFFF

**Body Small**
- Font: Poppins Regular
- Size: 14px / 0.875rem
- Line Height: 20px
- Color: #D1D5DB

**Arabic Text (Quran)**
- Font: Amiri Regular
- Size: 24-28px (responsive)
- Line Height: 40-48px
- Color: #FFFFFF
- Align: Right (RTL)

**Transliteration Rumi**
- Font: Poppins Italic
- Size: 16px
- Line Height: 24px
- Color: #9CA3AF
- Style: Italic

**Caption/Metadata**
- Font: Poppins Regular
- Size: 12px / 0.75rem
- Line Height: 16px
- Color: #9CA3AF

**Button Text**
- Font: Poppins SemiBold
- Size: 16px
- Color: #FFFFFF

---

## 🎭 Design Elements

### Spiritual Pulse Aura

**Glow Effect** - Aura di sekeliling elemen penting
```css
box-shadow: 
  0 0 20px rgba(15, 81, 50, 0.3),    /* Inner glow hijau */
  0 0 40px rgba(13, 202, 240, 0.2),  /* Outer glow cyan */
  0 0 60px rgba(15, 81, 50, 0.1);    /* Extended aura */
```

**Pulse Animation** - Gelombang nadi bergerak
```
Duration: 2000ms
Easing: ease-in-out
Loop: infinite
Scale: 1.0 → 1.05 → 1.0
Opacity: 0.8 → 1.0 → 0.8
```

### Gradient Applications

**Background Gradient** - Subtle
```css
linear-gradient(
  135deg,
  #111827 0%,     /* Base dark */
  #0f5132 50%,    /* Mid green */
  #1F2937 100%    /* End dark */
)
```

**Text Gradient** - Bold
```css
linear-gradient(
  90deg,
  #0f5132 0%,     /* Start green */
  #10B981 30%,    /* Mid green */
  #0dcaf0 100%    /* End cyan */
)
```

**Button Gradient** - Interactive
```css
linear-gradient(
  135deg,
  #0f5132 0%,
  #198754 50%,
  #0dcaf0 100%
)
```

### Border Radius

**Small:** 4px - Tags, chips  
**Medium:** 8px - Buttons, small cards  
**Large:** 12px - Cards  
**XLarge:** 16px - Featured cards  
**XXLarge:** 24px - Modals, sheets  
**Full:** 9999px - Pills, circular buttons

### Shadows

**Subtle (sm)**
```css
box-shadow: 0 2px 4px rgba(15, 81, 50, 0.1);
elevation: 2;
```

**Medium (md)**
```css
box-shadow: 0 4px 8px rgba(15, 81, 50, 0.15);
elevation: 4;
```

**Large (lg)**
```css
box-shadow: 0 8px 16px rgba(15, 81, 50, 0.2);
elevation: 8;
```

**Pulse Glow**
```css
box-shadow: 0 0 20px rgba(15, 81, 50, 0.5);
elevation: 12;
```

---

## 📐 Spacing System

**Base Unit:** 4px

```
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   12px  (0.75rem)
lg:   16px  (1rem)
xl:   20px  (1.25rem)
xxl:  24px  (1.5rem)
xxxl: 32px  (2rem)
```

### Layout Spacing

**Screen Padding:** 16px (lg)  
**Card Padding:** 16-20px (lg-xl)  
**Button Padding:** 12px 24px (md xxxl)  
**Section Gap:** 24px (xxl)  
**List Item Gap:** 12px (md)

---

## 🖼️ Iconography

### Style Guidelines

**Type:** Line icons (outline style)  
**Weight:** 2px stroke  
**Size:** 20px, 24px, 32px, 48px  
**Color:** Inherit from context atau #0dcaf0 (accent)

### Icon Usage

**Navigation Icons:** 24px, primary color  
**Action Icons:** 20px, muted color  
**Feature Icons:** 32px, gradient fill  
**Decorative Icons:** 48px, pulse glow effect

### Featured Icons

**Prayer Times:** 🕌 Mosque with pulse  
**Quran Reading:** 📖 Book with aura  
**AI Assistant:** 🤖 Brain with gradient  
**Learning:** 🎓 Graduation with glow  
**Hadith:** 📚 Library with shine  

---

## 🎬 Animations

### Micro-interactions

**Button Tap**
- Scale: 1.0 → 0.95 → 1.0
- Duration: 100ms
- Haptic: Light

**Card Press**
- Scale: 1.0 → 0.98 → 1.0
- Shadow: Expand
- Duration: 150ms

**Tab Switch**
- Fade + Slide
- Duration: 200ms
- Easing: ease-out

### Loading States

**Pulse Loader**
```
Shape: Circle
Animation: Pulse (scale + opacity)
Color: Gradient cycling
Duration: 1500ms
```

**Shimmer Effect**
```
Type: Skeleton screens
Gradient: Gray → Light Gray → Gray
Duration: 1000ms
Direction: Left to right
```

### Page Transitions

**Modal Appear**
```
Animation: Slide up + Fade in
Duration: 300ms
Easing: ease-out
```

**Navigation**
```
Animation: Slide + Fade
Duration: 250ms
Easing: ease-in-out
```

---

## 📱 Component Patterns

### Cards

**Primary Card**
```
Background: #1F2937
Border: None atau 1px #374151
Radius: 12px
Padding: 16-20px
Shadow: Medium
```

**Featured Card**
```
Background: Gradient
Border: 2px gradient
Radius: 16px
Padding: 20-24px
Shadow: Large + Glow
```

**Audio Playing Card**
```
Background: #064E3B (dark green)
Border-Left: 4px #10B981
Accent: Pulse animation
```

### Buttons

**Primary Button**
```
Background: Gradient (#0f5132 → #0dcaf0)
Text: Poppins SemiBold, #FFFFFF
Padding: 12px 24px
Radius: 12px
Shadow: Medium
```

**Secondary Button**
```
Background: #1F2937
Text: Poppins SemiBold, #0dcaf0
Border: 1px #0dcaf0
Padding: 12px 24px
Radius: 12px
```

**Icon Button**
```
Size: 40x40px
Radius: 20px (circle)
Background: #374151
Icon: 20px, #9CA3AF
Hover: Scale 1.1
```

### Input Fields

**Text Input**
```
Background: #1F2937
Border: 1px #374151
Focus Border: 2px #0dcaf0
Radius: 8px
Padding: 12px 16px
Text: Poppins Regular
Placeholder: #9CA3AF
```

---

## 🌟 Brand Voice

### Personality

**Spiritual** - Tenang, khusyuk, penuh makna  
**Modern** - Fresh, accessible, tech-savvy  
**Caring** - Empathetic, supportive, guiding  
**Confident** - Authoritative, reliable, trustworthy

### Tone of Voice

**Do:**
- ✅ Gunakan bahasa yang mesra dan mudah
- ✅ Motivasi dan semangat dalam setiap mesej
- ✅ Hormati sensitiviti Islam
- ✅ Jelas dan direct dalam guidance

**Don't:**
- ❌ Jangan terlalu formal atau kaku
- ❌ Jangan gunakan tech jargon yang complex
- ❌ Jangan buat assumptions tentang tahap ilmu user
- ❌ Jangan gunakan humor yang boleh disalah tafsir

### Example Messages

**Welcome:** "Assalamualaikum! Welcome to QuranPulse, your spiritual companion 💚"

**Error:** "Oops! Kami tidak dapat menyambung sekarang. Sila semak internet anda dan cuba lagi. 🔄"

**Success:** "Alhamdulillah! Bookmark berjaya disimpan ✨"

**Motivation:** "Keep going! Setiap bacaan membawa berkah 📖✨"

---

## 💎 Implementation Checklist

### Phase 1: Core Branding ✅
- [x] Update app.json dengan nama dan colors
- [x] Update package.json
- [x] Update environment variables
- [x] Create branding documentation

### Phase 2: Visual Assets 🎨
- [ ] Design app icon dengan pulse wave Q
- [ ] Create splash screen dengan gradient
- [ ] Design adaptive icons untuk Android
- [ ] Create promotional graphics

### Phase 3: Typography 📝
- [ ] Install Poppins font family
- [ ] Install Amiri font family
- [ ] Update theme.ts dengan complete typography scale
- [ ] Apply fonts throughout app

### Phase 4: Component Updates 🔧
- [ ] Apply gradient to primary buttons
- [ ] Add pulse animation to key elements
- [ ] Update card designs with new shadows
- [ ] Add glow effects to featured items

### Phase 5: Polish ✨
- [ ] Add micro-interactions
- [ ] Implement pulse animations
- [ ] Add haptic feedback
- [ ] Test across devices

---

## 📦 Assets Needed

### Fonts
- **Poppins:** Regular, Medium, SemiBold, Bold, ExtraBold
- **Amiri:** Regular, Bold, Italic, BoldItalic

### Icons & Graphics
- App icon (1024x1024) - Pulse wave Q
- Splash screen (multiple sizes)
- Adaptive icon foreground/background
- Feature icons set (prayer, quran, ai, etc.)
- Empty state illustrations

### Colors Export
```json
{
  "primary": "#0f5132",
  "secondary": "#0dcaf0",
  "success": "#10B981",
  "warning": "#F59E0B",
  "error": "#EF4444",
  "background": {
    "primary": "#111827",
    "secondary": "#1F2937",
    "tertiary": "#374151"
  }
}
```

---

## 🎓 Usage Guidelines

### When to Use Gradient

**Always Use:**
- Logo text
- Primary buttons
- Featured cards
- Hero sections
- Loading states

**Never Use:**
- Body text (readability)
- Small text (< 14px)
- Input fields
- Icons < 24px

### When to Use Glow Effect

**Appropriate:**
- Logo
- Featured content
- Active states
- Special achievements
- Audio playing indicators

**Avoid:**
- Every element (overwhelming)
- List items (visual noise)
- Navigation (distracting)
- Form fields (confusing)

---

## 🚀 Brand Evolution

**Current:** v2.0.0 - Modern Islamic Design  
**Next:** v2.1.0 - Enhanced animations  
**Future:** v3.0.0 - 3D elements, AR features

---

**Dibuat dengan ❤️ untuk umat Islam di seluruh dunia**

**"Follow the pulse of the Quran" 💚💙**
