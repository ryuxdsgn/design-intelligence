# ryux taxonomy (draft v0.1)

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
| `gov` | Government services | Later |

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
