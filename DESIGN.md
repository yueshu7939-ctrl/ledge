# Design System — Ledge

> 大字报 / Swiss Brutalist. Type and rules do all the work.
> Read this before making any visual decision. Do not deviate without explicit approval.

## Product Context

- **What this is:** A private single-user monthly ledger. Log spending by voice or by hand, track it against per-category budgets, see whether the month is going well.
- **Who it's for:** One person. The owner. Not a marketplace app, not a shared product.
- **Usage pattern:** Opened for ~10 seconds, once or twice a day, on a phone, often at night.
- **The one question the UI must answer instantly:** *Am I OK this month?*
- **Content is bilingual.** Transaction descriptions mix Chinese and English freely (`外卖`, `whole foods`, `打球`, `mistuwa`). Every type decision must survive this.
- **Project type:** Mobile-first PWA, single HTML file, no framework.

## Aesthetic Direction

- **Direction:** Swiss Brutalist / 大字报
- **Decoration level:** Minimal. Zero decoration. Structure is the only ornament.
- **Mood:** A printed financial notice, not a consumer app. Blunt, mechanical, unembarrassed. It should feel like the numbers are stating facts at you.
- **The rule:** if a visual element is not a number, a label, or a line that separates things, it does not belong.

### Hard prohibitions

These are not preferences. They are the system.

| Banned | Why |
|---|---|
| `border-radius` on anything | Zero radius everywhere. No exceptions, including buttons and inputs. |
| `backdrop-filter` / translucency | Every layer opaque. Layering is done with rules, not blur. |
| `box-shadow` | Depth comes from inversion, not elevation. |
| Gradients (decorative) | A gradient is only allowed if it encodes data, and currently nothing does. |
| Randomized background | The old `Math.random()*360` HSL background is deleted. The ground is a constant. |
| More than one accent colour | One signal colour. See Color. |
| Icons as decoration | Icons only where they replace a word that would not fit. |

## Color

**Approach:** restrained. Two neutrals and one signal. Colour appears only when something needs attention.

```
--paper      #FFFFFF   ground (light)
--ink        #000000   primary text, structural rules
--ink-mute   #666666   secondary meta only, never a number you care about
--rule-hard  #000000   2px structural divisions
--rule-soft  #DDDDDD   1px list separators
--acid       #D6FF3E   THE signal
```

**Dark mode** is a straight inversion, not a re-tint. This is the one place brutalism gets easy mode.

```
--paper      #000000
--ink        #FFFFFF
--ink-mute   #8A8A8A
--rule-hard  #FFFFFF
--rule-soft  #2A2A2A
--acid       #D6FF3E   unchanged, it works on both
```

**Semantic colour: there is none.** No red, no green, no amber. Over-budget is expressed by **inverting the block** (ink background, acid text). Under-budget is expressed by being ordinary. This is deliberate: the old design used four pastel hues that carried no meaning, so nothing stood out. Now exactly one condition gets a visual treatment, so that condition is impossible to miss.

Contrast floor: any number the user is meant to read is `--ink` on `--paper`. `--ink-mute` is permitted only for dates, category slugs, and unit labels.

## Typography

Three families, three jobs. Every one must be self-hosted or loaded from a CDN with `font-display: swap`.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display + UI (Latin) | **Archivo** | 500, 700, 900 | Tight neo-grotesque with a real Black. Carries the giant numerals. |
| Display + UI (Chinese) | **Noto Sans SC** | 500, 700, 900 | Required. Must be declared explicitly in every stack. |
| Labels, dates, percentages, amounts in lists | **JetBrains Mono** | 400, 700 | All-caps micro labels and any figure that needs to align in a column. |

**Stack declaration** — always in this order, never omit the CJK face:

```css
--font-ui:   'Archivo', 'Noto Sans SC', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Noto Sans SC', ui-monospace, monospace;
```

### CJK rules

1. CJK glyphs render optically larger than Latin at the same `font-size`. Chinese display text runs **~25% smaller** than its Latin counterpart (hero Latin 104px → hero Chinese 27px as a companion line, not a substitute).
2. CJK does not have a monospace advance that matches JetBrains Mono. Chinese never goes in a column that must align by character. Align money columns by right-aligning the figure, not by padding the description.
3. Chinese display text gets positive tracking (`letter-spacing: .06em`). Latin display text gets negative tracking (`-.055em`). Never share a tracking value across scripts.

### Scale (fixed steps, mobile 375px baseline)

| Token | Size / Weight / Tracking | Use |
|---|---|---|
| `hero` | 104px / 900 / -.055em | The one number. One per screen. |
| `hero-cn` | 27px / 900 / +.06em | Chinese companion line under `hero` |
| `stat` | 23px / 700 / 0 | Category percentage, meta figures |
| `title` | 15px / 700 / -.01em | Category name, transaction description |
| `body` | 13px / 500 / 0 | Transaction rows |
| `label` | 9px mono / 700 / .24em / UPPERCASE | Section labels, column heads |
| `meta` | 8.5px mono / 400 / .16em | Dates, category slugs, units |

All figures: `font-variant-numeric: tabular-nums;` plus `font-feature-settings: 'tnum';`. Non-negotiable — this is what makes a column scannable.

**One money formatter, used everywhere.** The current app renders `$8,000` and `$4135` and `+$1808` on the same screen. Every amount goes through a single function that emits thousands separators consistently. Mixed formatting is treated as a bug, not a style choice.

## Layout

- **Approach:** grid-disciplined. Hard gutters, full-bleed rules. Not editorial-asymmetric — this is a data screen and the grid must hold.
- **Gutter:** 16px left and right, everywhere, no exceptions.
- **Rules run edge to edge**, past the gutter, to the screen boundary. This is what makes it read as a printed form rather than a stack of cards.
- **Max content width:** 600px, centred, with 2px vertical rules on both sides above that width.
- **Border radius:** `0`. Every element.

### The hero number is SAVED, not REMAINING

The first draft put "还能花 / REMAINING" at the top. That is wrong for this user and it
is deleted. Framing the budget as an amount still available to spend turns a ceiling
into an allowance and quietly encourages spending up to it. The goal here is to spend
as little as possible, so the hero is the number that rises when the user does well:

```
已存 / SAVED          salary − fixed − variable
储蓄率 / RATE          saved ÷ salary
```

**Fixed and variable spending must never be summed into one figure on the main screen.**
Fixed cost (per-month `md.fixed`, editable in 设置; months predating the field stay on the legacy 4135) cannot be
influenced this month. Variable spending is the only number the user can act on today.
Merging them buries the actionable half under a dead constant.

### Structure of the main screen

```
┌──────────────────────────────────┐
│ Ledge              2026.06 D16/30│  header, 2px rule below
├──────────────────────────────────┤
│ SAVED                            │  label
│ 2057                             │  hero
│ 已存 · 储蓄率 26%                 │  hero-cn + rate
│ 比上月多存 $1,371                 │  status line, the motivating delta
├─────────┬──────────┬─────────────┤  2px rule
│ 固定    │ 可变     │ 上月同期     │  meta strip, 1px internal rules
│ 4,135   │ 1,808    │ 2,140       │  fixed is --ink-mute, it is not actionable
├──────────────────────────────────┤
│ 超支类别 / OVER              03  │  WATCH SLOT — see States
├──────────────────────────────────┤
│ BY CATEGORY                 EDIT │  EDIT switches this block to budget editing
│ 购物 SHOPPING 350/200       175 │  ← inverted (over)
│ 交通 TRANSPORT 240/200      120 │  ← inverted (over)
│ 吃饭 FOOD 530/800            66 │  ← normal
├──────────────────────────────────┤
│ 6 MONTHS                         │
│ ▁ ▂ █                            │  saved per month. Taller is better.
│ 04 05 06                         │
└──────────────────────────────────┘
```

The bottom strip charts **saved per month, not spent per month.** Bars growing is the
success state. The user's real data (422 → 686 → 2,057) is a steep climb, and that
story is the strongest thing the app has to show.

`LATEST` is not on this screen. A reverse-chronological list answers "what happened
recently", which is not a question the user opens the app to ask. It lives in `LEDGER`.

### Information architecture

One hard-ruled bottom strip, five cells, 2px top rule and 1px internal rules. Uppercase
mono labels. The active cell is inverted. The centre cell is the only acid-filled
interactive element in the entire app.

```
┌──────┬────────┬──────┬─────────┬────────┐
│ NOW  │ LEDGER │  ＋  │ HISTORY │ 设置    │
└──────┴────────┴──────┴─────────┴────────┘
```

| Surface | Holds |
|---|---|
| `NOW` | The month screen above. Defaults to the current month. |
| `LEDGER` | Full chronological transaction list, category filter, search. Absorbs the old `Transactions` tab and the demoted `LATEST`. |
| `＋` | Add an entry, by voice or by hand. |
| `HISTORY` | Month over month. See below. |
| `设置` | Salary, `FIXED`, PIN, voice language, CSV export. |

**Budget editing does not get its own tab.** Budgets are stored per month (April has 9
categories, June has 10), so editing them requires a month context. `EDIT` in the
category block header turns that block into editable rows for the month currently on
screen. The old app forced a jump to a separate `Budget` tab and lost the month
context on the way.

### HISTORY

- A bar chart of **saved per month**, hard rectangles, no axes, current month inverted.
- Below it a hard-ruled table: month × 固定 / 可变 / 已存 / 储蓄率, all `tabular-nums`.
- Tapping a month sets that month as the `NOW` context.
- Below that, a small-multiples grid: one micro bar row per category, showing its trend.

**Below 3 months of data, the chart is not drawn — table only.** Two bars is not a trend,
it is decoration pretending to be information.

## States and Edge Cases

The main screen has an escalation ladder. Exactly one rung is active at a time.

| Rung | Condition | Hero block | Category rows |
|---|---|---|---|
| 1 | No category over its ceiling | Normal ink | All normal |
| 2 | 1–3 categories over | Normal ink + status line `3 类超支 · 净超 $201` | Over rows inverted, sorted to top |
| 3 | 4+ categories over | Same, but the watch slot goes full-bleed acid showing **net overage**, not a count | Over rows get a 4px acid left edge, **not** full inversion |
| 4 | Saved is negative | **Whole hero block inverted**, acid numeral | As rung 2 or 3 |

**Why rung 3 stops inverting.** Eight inverted rows in a column is a solid black slab,
and inversion stops meaning anything once it is the majority — the same failure as the
old four-pastel-tile dashboard. At that density the aggregate is the story, so the
overage total is promoted and the individual rows step back to an edge marker.

**Why a positive hero can coexist with a broken structure.** Saved can be healthy while
several ceilings are blown, because one large under-spent category (grocery, 127 of
1,500) masks the rest. This is the user's actual June. The status line under the hero
therefore always carries the structural truth; the hero number alone is never allowed
to be the only signal.

### The watch slot always speaks

The slot below the meta strip never disappears and never says "everything is fine".

| Condition | Content | Colour |
|---|---|---|
| Something is over | `超支类别 / OVER  ·  03` | acid block |
| Nothing is over | `最接近上限 / CLOSEST  ·  剪发 71%` | ink, no acid |

Acid is reserved for a real breach. When the slot degrades to `CLOSEST` it stays ink, so
acid keeps its signal value. An empty slot is rejected because "nothing here" is
indistinguishable from "the data failed to load" — the exact ambiguity that caused the
August 2026 outage to go unnoticed.

### Empty and sparse states

| Case | Treatment |
|---|---|
| Month with zero entries | Hard-ruled block: `本月还没有记录 / NO ENTRIES YET`. Hero shows saved = salary − fixed. Watch slot shows `—`. |
| Fewer than 3 months of history | `HISTORY` chart suppressed, table only. The 6-month strip on `NOW` renders only the months that exist, left-aligned, not padded with empty slots. |
| A category with budget 0 **and** no spend | Not rendered. April carries `travel: 0` and `other: 0`; they are noise. Spend with no budget still renders, with `—` in the percentage column — hiding money that was actually spent is never acceptable. |
| Salary or `FIXED` unset | Hero cannot be computed. Show `设置薪资 / SET SALARY` as an acid block in the hero slot rather than rendering `$0`. |

## Spacing

- **Base unit:** 4px
- **Density:** compact. Brutalism separates with rules, not air.
- **Scale:** `2xs 2 · xs 4 · sm 8 · md 16 · lg 24 · xl 32 · 2xl 48`
- Inside a block: 8–14px vertical
- Between blocks: a 2px rule, not a gap. Whitespace is for the hero only.

## Motion

**Approach:** minimal-functional, bordering on none. Brutalism does not animate.

Exactly one animation is permitted:
- The hero numeral counts up on load, 200ms, `ease-out`. (Not yet implemented.)

**The voice control is a full-width acid bar docked above the nav, not a floating button.**
A floating FAB covered the percentage column of the category rows, which is the one number
that block exists to show. Docking it also makes it the only acid-filled interactive
element besides the `＋` nav cell.

Everything else is instant. No page transitions, no fades, no spring, no hover lift. State changes are immediate redraws.

Reduced-motion: the count-up is skipped entirely.

## Migration Notes

What this direction removes from `public/index.html`:

| Remove | Location |
|---|---|
| Random HSL background generator | the `RANDOM BACKGROUND` IIFE |
| Every `backdrop-filter` / `-webkit-backdrop-filter` | `.header`, `.tabs`, `.metric`, `.card` |
| Every `border-radius` | throughout |
| Four pastel metric tiles | `.m-salary` `.m-spent` `.m-budget` `.m-saved` |
| Purple→orange gradient on the mic FAB | mic button |
| Six-tab horizontal scroller | `.tabs`, `.tab` |

What this direction fixes:

- Inconsistent money formatting (`$4,135` vs `$4135` vs `+$1808`) → one formatter
- Budget bar reading `0% used` while the total reads `$4135 / $4,135` → single source of truth
- Tab bar clipping `Analysis` and `Settings` off-screen → they move to `MORE`
- `#aaa` / `#bbb` text on a pale ground → `--ink-mute` at 4.5:1 minimum

### App icon

The mark is the word **已存** — black type on an acid ground, filling the tile edge to
edge. Same word, same treatment as the hero companion line on the main screen, so the
icon and the product say the same thing.

- Glyphs are **outlined to vector paths** (from Heiti SC Medium, stroke-bulked toward a
  Black weight) rather than set as `<text>`. An SVG icon cannot rely on a webfont, and
  PingFang has no 900 weight, so live text would render thin and inconsistent.
- `purpose` is `any`, **not** `maskable`. Android's circular mask clips the left and right
  edges of both glyphs. iOS uses a rounded square, which preserves the horizontal band the
  type occupies, so the design holds where this app is actually used.
- Legible down to 32px. At 16px two CJK glyphs are inherently mushy; that is the floor for
  any Chinese logotype and is accepted.

**Known gap:** `apple-touch-icon` points at the SVG, but iOS requires a PNG for the home
screen. A 180×180 PNG export is still owed.

## Open Questions

- **Pure white at night.** A 大字报 white ground is harsh in a dark room, and this app gets opened at night. Dark mode is specced above as a straight inversion, but it should probably default to following the system rather than being an opt-in toggle.
- **Alibaba PuHuiTi (阿里巴巴普惠体)** has more character than Noto Sans SC at heavy weights and is free for commercial use. Worth evaluating as the CJK display face once the system is standing.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-18 | Direction: 大字报 / Swiss Brutalist | Chosen over a receipt metaphor and a gauge-led dashboard. Fastest instant read of the three, and the Chinese-heavy-type treatment is a space nobody in this category occupies. |
| 2026-08-18 | No semantic colour. Over-budget = inverted block + acid | The previous design spent four pastel hues on decoration, so nothing could stand out. One condition, one treatment. |
| 2026-08-18 | Noto Sans SC declared in every font stack | Content is ~50% Chinese. A Latin-only stack silently breaks the type system. |
| 2026-08-18 | Six tabs collapse to one scroll + bottom action | The product answers one question. The old layout gave six surfaces equal weight. |
| 2026-08-18 | Hero is 已存 / SAVED, not 还能花 / REMAINING | User's goal is to spend as little as possible. "Remaining" frames a ceiling as an allowance and encourages spending up to it. The hero must rise when the user does well. |
| 2026-08-18 | Fixed and variable spend never merged on the main screen | `FIXED` (4135) cannot be influenced this month. Merging it with variable spend buries the only number the user can act on. |
| 2026-08-18 | 6-month strip charts saved per month, not spent | Taller is better reads correctly for a saving goal. The real data (422 → 686 → 2,057) is the strongest story the app has. |
| 2026-08-18 | Watch slot never empties; degrades to CLOSEST in ink | An empty slot is indistinguishable from a failed load — the exact ambiguity behind the August 2026 silent-blank-screen outage. |
| 2026-08-18 | Inversion caps at 3 over-budget rows | Inversion stops signalling once it is the majority. Same failure mode as the old four-pastel-tile dashboard. |
| 2026-08-18 | Fixed expenses became per-month data (`md.fixed`), editable in 设置 | Rent changes over time. Editing the default stamps history first, so past months keep the value they were lived under — a change today must never rewrite April's savings rate. |
