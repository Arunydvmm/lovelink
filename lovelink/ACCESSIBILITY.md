# LoveLink Accessibility Guide (WCAG 2.1 AA)

## Overview
LoveLink is designed to be accessible to all users, including those with disabilities. We follow WCAG 2.1 Level AA guidelines.

## Keyboard Navigation ⌨️

- **Tab**: Navigate forward through interactive elements
- **Shift+Tab**: Navigate backward
- **Enter**: Activate buttons/links
- **Space**: Toggle checkboxes/buttons
- **Escape**: Close modals/dropdowns
- **Arrow Keys**: Navigate menu items, sliders

All interactive elements are keyboard accessible without requiring mouse.

## Screen Reader Support 🔊

- All images have alt text descriptions
- Form inputs have associated labels
- ARIA labels on icon-only buttons
- Semantic HTML structure
- Proper heading hierarchy (h1 → h2 → h3)
- Skip navigation links

## Visual Design 👁️

### Color Contrast
- All text meets WCAG AA contrast ratios (4.5:1 minimum)
- Color not the only indicator (patterns, text labels used)

### Text & Typography
- Readable font sizes (minimum 16px for body text)
- Line height ≥ 1.5 for readability
- Max line length ~80 characters
- Resizable text support (pinch zoom, browser zoom)

### Focus Indicators
- All interactive elements have visible focus states
- Focus rings have sufficient contrast
- Focus order is logical and intuitive

## Responsive Design 📱

### Breakpoints
- **320px**: Mobile phones (minimum)
- **360px**: Small phones
- **375px**: iPhone
- **414px**: Large phones
- **768px**: Tablets
- **1024px**: Desktops
- **1920px**: Large screens

### Touch Targets
- Minimum 48px × 48px for touch targets
- Adequate spacing between interactive elements
- No small buttons or links

## Semantic HTML Structure

```html
<!-- ✅ Good -->
<button aria-label="Close menu">×</button>
<nav aria-label="Main navigation">...</nav>
<article>
  <h1>Story Title</h1>
  <p>Content...</p>
</article>

<!-- ❌ Bad -->
<div onClick="closeMenu()">×</div>
<div>Navigation links</div>
<div>
  <div>Story Title</div>
  <div>Content...</div>
</div>
```

## Form Accessibility

- Every input has associated `<label>` with `for` attribute
- Error messages linked to inputs with `aria-describedby`
- Required fields marked with `aria-required="true"`
- Form validation messages are associated with inputs

```html
<!-- ✅ Good -->
<label for="email">Email Address *</label>
<input id="email" type="email" aria-required="true" aria-invalid="false" />

<!-- ✅ With Error -->
<label for="password">Password *</label>
<input 
  id="password" 
  type="password"
  aria-invalid="true"
  aria-describedby="password-error"
/>
<span id="password-error" role="alert">Password must be at least 8 characters</span>
```

## ARIA Labels

All icon-only buttons must have ARIA labels:

```jsx
// ✅ Good
<button aria-label="Close modal">
  <X size={24} />
</button>

// ✅ Alternative
<button title="Close modal">
  <X size={24} />
</button>

// ❌ Bad - no accessible name
<button>
  <X size={24} />
</button>
```

## Modals & Dialogs

- Modal has `role="dialog"` or `<dialog>`
- Modal title referenced with `aria-labelledby`
- Modal content described with `aria-describedby` if needed
- Focus trapped within modal
- Escape key closes modal

```jsx
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Confirm Action</h2>
  <p>Are you sure?</p>
  <button autoFocus>Yes</button>
  <button>Cancel</button>
</div>
```

## Animations & Motion

- All animations can be disabled with `prefers-reduced-motion`
- Auto-playing videos/animations have controls
- Content doesn't flash more than 3 times per second

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Color Blindness Support

- Red/green not the only color coding
- Patterns + colors used together
- Sufficient contrast for all color combinations

## Testing Checklist ✓

- [ ] All pages keyboard navigable
- [ ] All images have alt text
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] Form labels present
- [ ] Semantic HTML used
- [ ] Responsive at all breakpoints
- [ ] Touch targets ≥ 48px
- [ ] Aria labels on icon buttons
- [ ] Screen reader tested
- [ ] Mobile accessibility tested
- [ ] Tested with accessibility tools:
  - axe DevTools
  - WAVE
  - Lighthouse
  - NVDA/JAWS (screen readers)

## Testing Tools

1. **axe DevTools Browser Extension**
   - Install from Chrome/Firefox store
   - Click icon to scan page
   - Reports violations with fixes

2. **Lighthouse (Chrome DevTools)**
   - DevTools → Lighthouse
   - Run audit
   - Check Accessibility score

3. **Screen Reader Testing**
   - Windows: NVDA (free) or JAWS
   - macOS: VoiceOver (built-in)
   - Navigate page and verify narration

4. **Color Contrast**
   - Use WebAIM Contrast Checker
   - Verify all text meets AA standards

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
