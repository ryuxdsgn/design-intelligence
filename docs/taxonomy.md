# RYUX taxonomy (draft v0.2)

The taxonomy has four layers of tags: app category, flow type, pattern, and component. Slugs use lowercase and hyphens, in English so agents can work with them easily; labels are shown in Indonesian.

## App category

| Slug | Label | Pilot |
| --- | --- | --- |
| `fnb` | F&B and food delivery | Yes |
| `ecommerce` | E-commerce and marketplace | Yes |
| `pos-umkm` | Point of sale and business management | Yes |
| `ride-hailing` | Transport and super app | Later |
| `ewallet` | Digital wallet | After launch |
| `digital-bank` | Digital bank | After launch |
| `investment` | Investment | After launch |
| `travel` | Tickets and travel | Later |
| `health` | Health and telemedicine | Later |
| `edtech` | Education | Later |
| `gov` | Government services (web portals and apps) | Yes |
| `saas` | Business software and SaaS (web) | Yes |

## Platform

| Slug | Label |
| --- | --- |
| `android` | Android app |
| `ios` | iOS app |
| `web` | Website or web app, captured at 1440 and 390 wide |

## Flow type

| Slug | Label |
| --- | --- |
| `onboarding` | Onboarding and app introduction |
| `signup-login` | Sign up and log in (including OTP) |
| `ekyc` | Identity verification |
| `home-discovery` | Home and discovery |
| `search-filter` | Search and filter |
| `product-detail` | Product or menu detail |
| `cart-checkout` | Cart and checkout |
| `payment` | Payment |
| `topup` | Balance top-up |
| `order-tracking` | Order tracking |
| `promo-voucher` | Promos, vouchers, and cashback |
| `subscription` | Subscription and paywall |
| `profile-settings` | Profile and settings |
| `empty-error` | Empty state and error |
| `review-rating` | Reviews and ratings |

## Local patterns

| Slug | Label | Characteristics |
| --- | --- | --- |
| `qris` | QRIS | Scan or display the code, confirm the amount |
| `virtual-account` | Virtual account | Choose a bank, copy the VA number, payment deadline |
| `ewallet-link` | E-wallet link | Connect the account, redirect to the wallet app |
| `paylater` | Paylater | Limit, tenor, installment simulation |
| `installment` | Card installment | Tenor and interest options |
| `cod` | Cash on delivery | Confirmation and notes for the courier |
| `otp-sms-wa` | OTP via SMS or WhatsApp | Channel choice, resend countdown |
| `ktp-capture` | KTP photo and selfie | Framing guidance, explanation of the reason |
| `cashback-coins` | Cashback and coins | Points balance, discount at checkout |
| `flash-sale` | Flash sale | Countdown, limited stock |
| `rupiah-input` | Rupiah amount input | Rp prefix, thousands separator, quick amounts |
| `address-pinpoint` | Address and location pin | Landmark, house details, map pin |

## General patterns

Patterns that are not specific to Indonesia, for flows such as dashboards, forms, and government or
SaaS portals. They are tagged like local patterns (layer `pattern`). A pattern seen in real apps is
an observed pattern, not a best practice.

| Slug | Label | What to look for |
| --- | --- | --- |
| `progressive-disclosure` | Progressive disclosure | Secondary detail behind an expander, tab, or "more" link |
| `multi-step-form` | Multi-step form | One topic per step, progress shown, input kept between steps |
| `confirmation-step` | Confirmation before commit | Amount, recipient, and cost shown before the final action |
| `transaction-receipt` | Transaction receipt | Status, amount, reference number, share or save |
| `status-timeline` | Status timeline | Steps of an application or order with the current one marked |
| `summary-cards` | Summary cards | A few key numbers above the detail |
| `data-table` | Data table | Sortable columns, filters, and row actions |
| `empty-state` | Empty state | What belongs here and the first action to take |
| `inline-validation` | Inline validation | The error next to the field, with input kept |
| `sidebar-navigation` | Sidebar navigation | Persistent sections for desktop web apps |

## Components

| Slug | Label |
| --- | --- |
| `bottom-sheet` | Bottom sheet |
| `modal` | Modal or dialog |
| `pin-pad` | PIN pad |
| `otp-input` | OTP field |
| `payment-method-picker` | Payment method picker |
| `promo-banner` | Promo banner |
| `stepper` | Step indicator |
| `tab-bar` | Bottom navigation |
| `chip-filter` | Chip filter |
| `card-list` | Card list |
| `countdown` | Countdown |
| `toast-snackbar` | Toast or snackbar |
| `skeleton` | Skeleton loading |
| `map-view` | Map view |

## Usage rules

- Every screen must have exactly one category and one flow type (inherited from the flow), plus zero or more patterns and components
- New slugs may only be added by an admin, and are recorded in the change log below
- AI tags that do not match an existing slug are rejected, not created automatically
- Review the taxonomy again after the pilot of 10 apps

## Change history

| Version | Change |
| --- | --- |
| v0.1 | Initial draft for the pilot |
| v0.2 | Added `saas`, the Platform layer (`android`, `ios`, `web`), and General patterns; `gov` moved into the pilot, for web references |
