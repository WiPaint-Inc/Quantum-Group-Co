# Placeholders and confirmations

Public pages keep these notes out of production HTML. They render only in development, or when NEXT_PUBLIC_SHOW_PLACEHOLDERS=true. Do not replace a note with final copy until the owner clears it.

| Key | Kind | Page | Needed |
| --- | --- | --- | --- |
| design-build-contract | CONFIRM | Full Design and Build Services | Whether the service is one fixed-scope contract or phased. |
| engineering-scope | CONFIRM | Engineering | In-house engineering scope versus engineers retained per project. |
| drawing-certification | CONFIRM | Full Rendering, Design, Engineering & Plans | drawing certification / stamping details |
| renovation-only | CONFIRM | Construction | Whether renovation-only projects are taken. |
| infrastructure | CONFIRM | Construction | Whether infrastructure is offered to private clients or only inside developments. |
| energy-service | CONFIRM | Engineering | Whether energy engineering is a named service. |
| development-types | CONFIRM | Developments | Types and scale of development the company will take on. |
| development-role | CONFIRM | Developments | Whether the company acts only as contractor, or also as co-developer or development manager. |
| development-projects | PLACEHOLDER | Developments | Current or upcoming development projects, if any can be named publicly. |
| product-line-name | CONFIRM | Construction Materials Distribution | Product-line name to use. The VIVID Industrial & Decor wording is behind SHOW_VIVID_PRODUCT_LINES. |
| showroom | CONFIRM | Construction Materials Distribution | Whether there is a showroom, and where. |
| third-party-materials | CONFIRM | Construction Materials Distribution | Whether other brands are distributed, or only the precast lines. |
| level-5 | CONFIRM | Finishing | Whether to keep the level 5 sheetrock wording. It is a finish grade, not a certification. |
| maintenance-plan | CONFIRM | Finishing | Whether maintenance is a contract or a service plan. |
| heritage-finishing | PLACEHOLDER | About | finishing heritage. No dates until the final copy arrives. |
| heritage-construction | PLACEHOLDER | About | construction heritage. No dates until the final copy arrives. |
| heritage-join | PLACEHOLDER | About | how the two practices became one company. No date until the final copy arrives. |
| portfolio-captions | PLACEHOLDER | Partner Portfolio | public caption for each partner project. Do not add a client or company name. |
| portfolio-images | PLACEHOLDER | Partner Portfolio | final gallery images. Current plates stay until replacements arrive. |
| heritage-1981 | CONFIRM | About | Wording for the 1981 Italian family construction business, which the brochure says was under a different name. |
| heritage-dates | CONFIRM | About | Approval to keep publishing 1981, 2013, and January 2020. |
| founding | PLACEHOLDER | About | Quantum Group Co founding date and legal entity, if they should be shown. |
| partner-materials | PLACEHOLDER | About | partner/affiliate company content — awaiting owner materials |
| page-16-grouping | CONFIRM | Partner Portfolio | How the remaining gallery pages should be grouped. Do not publish a project name until a public caption is approved. |
| chris-headshot | PLACEHOLDER | Team | Headshot for Chris Bento. |
| chris-bio | PLACEHOLDER | Team | Anything further Chris wants in his bio. |
| marco-card | CONFIRM | Team | Confirm Marco Spagnolo's card for public display. |
| marco-years | CONFIRM | Team | The 2022 brochure said 15 years. Update before showing a figure. |
| marco-degree | CONFIRM | Team | Combined wording for the civil engineering degree, energy specialisation, and University of Bologna. |
| marco-headshot | PLACEHOLDER | Team | Headshot for Marco Spagnolo. |
| luigi-card | CONFIRM | Team | Confirm Luigi Spagnolo's card for public display. |
| luigi-years | CONFIRM | Team | The 2022 brochure said 17 years. Update before showing a figure. |
| luigi-headshot | PLACEHOLDER | Team | Headshot for Luigi Spagnolo. |
| contact-phone-email | PLACEHOLDER | Contact | contact phone/email |
| contact-email | PLACEHOLDER | Contact | Quantum Group Co email. Do not reuse a partner address. |
| contact-phone | PLACEHOLDER | Contact | Quantum Group Co phone or WhatsApp. Do not reuse a partner number. |
| contact-address | PLACEHOLDER | Contact | Office or showroom address. |
| contact-social | PLACEHOLDER | Contact | Social links. |
| leadership | PLACEHOLDER | About | leadership names/titles, if owner wants them shown |
| representative | PLACEHOLDER | Your Build, Live | Name of the designated Representative, if one should be shown. |
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
