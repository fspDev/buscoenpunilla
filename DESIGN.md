---
name: Professional Service Marketplace
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434654'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1200px
---

## Brand & Style

The design system is anchored in the concepts of **reliability, accessibility, and professional competence**. It is tailored for a marketplace connecting skilled service providers with customers, requiring a visual language that feels both authoritative and easy to navigate. 

We utilize a **Corporate / Modern** design style. This approach prioritizes clarity and functional efficiency through generous whitespace, a structured grid, and high-quality typography. The goal is to evoke an emotional response of security and "getting the job done" right. Every interface element is designed to minimize cognitive load, ensuring that users—whether they are homeowners or independent contractors—can find what they need with minimal friction.

## Colors

The palette is strategically chosen to foster trust and highlight successful outcomes. 

- **Primary (Professional Blue):** A deep, stable blue used for core branding, primary actions, and navigation. It represents the "Expert" persona of the platform.
- **Secondary (Emerald Green):** Reserved for "Success" states, confirmation messages, and "Contact Now" actions. It provides a positive visual cue for growth and connection.
- **Neutral (Slate & Grey):** A range of greys used for text, borders, and subtle backgrounds to keep the interface grounded and clean.
- **Default Mode:** `Light`. The interface uses a crisp off-white background to ensure maximum legibility and a sense of openness.

## Typography

This design system utilizes **Inter** for its exceptional legibility and modern, systematic feel. The type hierarchy is designed to guide the user's eye from broad category headings down to fine-print service details.

- **Headlines:** Use Bold weights with tight letter-spacing for a commanding, professional presence.
- **Body Text:** Set with generous line height to ensure long descriptions of services remain readable.
- **Labels:** Used for metadata (tags, ratings, price indicators) to provide quick, scannable information at a glance.
- **Scaling:** On mobile devices, large headlines scale down to prevent excessive word-breaking and maintain a clean vertical rhythm.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum container width to maintain readability on ultra-wide monitors. 

- **Grid:** A 12-column system is used for desktop, collapsing to 1 column on mobile.
- **Rhythm:** An 8px base unit (0.5rem) governs all spacing. Gutters are consistently 16px to provide enough breathing room between cards and content blocks.
- **Adaptivity:** 
    - **Desktop:** Centered 1200px container with 32px margins.
    - **Tablet:** 8-column grid with 24px margins.
    - **Mobile:** Single-column stacking with 16px side margins to maximize screen real estate for service images and text.

## Elevation & Depth

Visual hierarchy is established using **Ambient Shadows** and **Tonal Layers**. This design system avoids harsh, heavy shadows in favor of diffused, low-opacity depth cues.

- **Level 0 (Background):** Surface color is `#F9FAFB`.
- **Level 1 (Cards/Inputs):** White background with a subtle 1px border (`#E5E7EB`) and a soft shadow (0px 4px 6px -1px rgba(0,0,0,0.1)). This makes provider profiles feel "interactive" and elevated from the background.
- **Level 2 (Modals/Dropdowns):** Higher contrast shadow to indicate temporary overlay and focus.

Interactive elements use a "lift" effect on hover, where the shadow slightly deepens to provide tactile feedback to the user.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius. This softens the "corporate" feel of the blue palette, making the platform feel approachable and modern rather than stiff and institutional.

- **Buttons:** Fully rounded or 8px corners depending on context, though 8px is the standard for primary actions.
- **Cards:** Use a 1rem (16px) radius for larger containers (like provider profiles) to create a friendly, modern frame.
- **Input Fields:** Use an 8px radius to match the primary button style, creating a cohesive visual unit when paired together.

## Components

### Buttons
- **Primary:** Solid Blue (`#0052CC`) with white text. High emphasis for "Book Now" or "Post Job."
- **Secondary:** Solid Green (`#10B981`) or Outline Green for "Success" actions like "Message Sent" or "Confirm Appointment."
- **Tertiary:** Light grey ghost buttons for "Cancel" or "Go Back."

### Cards
Service provider cards are the core of the UI. They feature:
- A top-aligned image (service photo).
- A 16px internal padding.
- A dedicated "Rating/Price" label in the top right corner.
- Soft shadow on hover to indicate clickability.

### Input Fields
- **Default:** White background with a light grey border.
- **Focus:** Border changes to Primary Blue with a 2px soft outer glow.
- **Labels:** Always positioned above the field in `label-md` for accessibility.

### Navigation
- **Header:** Sticky top bar with a clean white background. 
- **Logo:** Positioned left.
- **Search:** A prominent, clean search bar in the center for quick provider discovery.
- **User Actions:** Clear profile and notification icons on the right.

### Chips & Tags
Used for service categories (e.g., "Plumbing", "Electrical"). These use a low-opacity background of the primary blue with darker blue text to indicate categorization without distracting from the main action.