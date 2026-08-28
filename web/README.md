# RazorGuard - Razorpay Duplicate Transaction Detection System

A luxury, professional, and well-organized web landing and dashboard simulation system built for high-growth merchants using Razorpay. Inspired by the clean panel design, spacious typography, and elegant maritime lines of **Beneteau.com**.

## Technology Stack

- **Framework**: Next.js 14 (React Framework)
- **Styling**: Tailwind CSS & Vanilla CSS (Custom classes for glassmorphism panels, floating effects, and luxury mesh gradients)
- **Animations**: Framer Motion (Transitions, accordion expansions, scroll reveals)
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Features & Pages

1. **Home Page (`/`)**: High-impact luxury hero banner, dynamic live transaction feed ticker, problem-solution briefs, animated flowchart steps, results counters, and Operations testimonials.
2. **Features Page (`/features`)**: In-depth description of the 6 core pillars of the duplicate detector engine, and a comparison table matching RazorGuard against manual processes and tokenized idempotency.
3. **How It Works (`/how-it-works`)**: System architecture flowchart diagram rendered dynamically with interactive FAQ accordion grids.
4. **Interactive Sandbox Demo (`/demo`)**: Live upload zone supporting CSV transaction ledgers. Simulates the backend XGBoost model logic client-side to flag double-clicks and timeout duplicates, showing auto-refund alerts and exporting logs. Includes a downloadable template `sample_transactions.csv`.
5. **Results & Analytics (`/results`)**: High-impact statistics counters, custom interactive SVG charts (revenue timeline, ROC-AUC performance curves, duplicate ratio charts), and client case studies.
6. **Contact Hub (`/contact`)**: Form queries validation console, company support handles, office geolocations, and social links.

## Getting Started & Run Scripts

Ensure you have Node.js installed on your machine.

First, navigate to the `web` folder:

```bash
cd web
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build and Deployment

To run a production-ready check and compile the application:

```bash
npm run build
```

To start the compiled production build locally:

```bash
npm run start
```

To run TypeScript compiler diagnostics and ESLint audits:

```bash
npm run lint
```
