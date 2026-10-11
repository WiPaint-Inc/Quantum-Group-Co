# Placeholders and confirmations

Public pages keep these notes out of production HTML. They render only in development, or when NEXT_PUBLIC_SHOW_PLACEHOLDERS=true. Do not replace a note with final copy until the owner clears it.

| Key | Kind | Page | Needed |
| --- | --- | --- | --- |
| design-build-contract | CONFIRM | Full Design and Build Services | Is Full Design and Build offered as a single fixed-scope contract, or structured in phases? |
| rendering-media | CONFIRM | Full Rendering, Design, Engineering & Plans | interior, exterior, or both? Still images, animations or walkthroughs? |
| engineering-scope | CONFIRM | Full Rendering, Design, Engineering & Plans | in-house engineering scope versus engineers retained per project |
| drawing-sets | CONFIRM | Full Rendering, Design, Engineering & Plans | which drawing sets are included, for example architectural, structural, MEP, and who submits for planning approval |
| plans-only | CONFIRM | Full Rendering, Design, Engineering & Plans | can clients commission plans only, without a build contract? |
| drawing-certification | CONFIRM | Full Rendering, Design, Engineering & Plans | drawing certification / stamping details |
| renovation-only | CONFIRM | Construction | does Quantum take on renovation-only projects? |
| infrastructure | CONFIRM | Construction | is infrastructure offered to private clients, or only within developments? |
| engineering-drawings | CONFIRM | Engineering | exact scope, and whether drawings are produced in-house or by retained engineers |
| energy-service | CONFIRM | Engineering | is energy engineering offered as a named service? |
| development-types | CONFIRM | Developments | types and scale of development Quantum will take on |
| development-role | CONFIRM | Developments | does Quantum act only as contractor, or also as co-developer or development manager? |
| development-projects | PLACEHOLDER | Developments | current or upcoming development projects, if any can be named publicly |
| product-line-name | CONFIRM | Construction Materials Distribution | product-line name to use on the Quantum site |
| precast-2020 | CONFIRM | About | January 2020 precast date |
| showroom | CONFIRM | Construction Materials Distribution | is there a showroom, and where? |
| third-party-materials | CONFIRM | Construction Materials Distribution | does Quantum distribute other brands' materials, or only its own precast lines? |
| level-5 | CONFIRM | Finishing | keep level 5? It is a technical finish grade, not a certification. |
| maintenance-plan | CONFIRM | Finishing | is maintenance offered as a contract or a service plan? |
| heritage-finishing | PLACEHOLDER | About | finishing heritage. No dates until the final copy arrives. |
| heritage-construction | PLACEHOLDER | About | construction heritage. No dates until the final copy arrives. |
| heritage-join | PLACEHOLDER | About | how the two practices became one company. No date until the final copy arrives. |
| heritage-dates | CONFIRM | About | Approval to keep publishing 2013 and January 2020. Italian roots stay, with no year. |
| founding | PLACEHOLDER | About | Quantum Group Co founding date and legal entity, if they should be shown. |
| partner-materials | PLACEHOLDER | About | partner/affiliate company content — awaiting owner materials |
| page-16-grouping | CONFIRM | Partner Portfolio | page-16 project grouping |
| chris-headshot | PLACEHOLDER | Team | Headshot for Chris Bento. |
| chris-bio | PLACEHOLDER | Team | Anything further Chris wants in his bio. |
| marco-degree | CONFIRM | Team | Combined wording for the civil engineering degree, energy specialisation, and University of Bologna. |
| marco-headshot | PLACEHOLDER | Team | Headshot for Marco Spagnolo. |
| contact-phone-email | PLACEHOLDER | Contact | contact phone/email |
| contact-email | PLACEHOLDER | Contact | Quantum Group Co email. Do not reuse a partner address. |
| contact-phone | PLACEHOLDER | Contact | Quantum Group Co phone or WhatsApp. Do not reuse a partner number. |
| contact-address | PLACEHOLDER | Contact | Office or showroom address. |
| contact-social | PLACEHOLDER | Contact | Social links. |
| leadership | PLACEHOLDER | About | leadership names/titles, if owner wants them shown |
| representative | PLACEHOLDER | Your Build, Live | Name of the designated Representative, if one should be shown. |
| client-app | CONFIRM | Your Build, Live | the client project app is not built yet. Confirm launch timing and platform (iOS/Android/web) before go-live. |

[CONFIRM: the client project app is not built yet. Confirm launch timing and platform (iOS/Android/web) before go-live.]
| eco-credentials | PLACEHOLDER | About | eco credentials. Do not claim a certification, or an energy or performance figure, until the owner supplies it. |

## Payments

These are environment values, not page copy. Defaults are placeholders and payments stay off.

- PAYMENTS_ENABLED is false until Antigua counsel signs off and invoice payments are turned on.
- PAY_QUANTUM_BASE_ADDRESS, PAY_QUANTUM_ETHEREUM_ADDRESS, and PAY_QUANTUM_SOLANA_ADDRESS are placeholders. PAY_BASE_ADDRESS, PAY_ETHEREUM_ADDRESS, and PAY_SOLANA_ADDRESS are aliases for that profile only.
- PAY_BOT_BASE_ADDRESS, PAY_BOT_ETHEREUM_ADDRESS, and PAY_BOT_SOLANA_ADDRESS are different placeholders. The two profiles must not share an address.
- NEXT_PUBLIC_REOWN_PROJECT_ID is empty, so wallet connection stays off.
- SANCTIONS_API_URL and SANCTIONS_API_KEY are empty, so the address screen allows a payment and no list is queried.
- PAYMENT_LOG_WEBHOOK_URL is empty, so a confirmed payment is written to the server console only.
- ANONYMOUS_TIP_CAP_USD defaults to 1000. This site does not show tip mode.
- AGENT_API_KEY is empty.
- NEXT_PUBLIC_SITE_URL still uses the example origin.
