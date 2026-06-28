# Tezzo — Carpooling Platform Website

Static HTML/CSS/JS website for Tezzo, India's carpooling platform.

## Pages
- `index.html` (same as `tezzo.html`) — Homepage with ride search/booking (now functional: search scrolls to results with feedback toast, Log in/Sign up open a waitlist modal)
- `compare.html` — Pricing plans & comparison vs bus/train/cab
- `systemdesign.html` — How it works, architecture, tech stack
- `ghost.html` — Ghost Mode (incognito riding) feature page
- `bio.html` — About us, team, timeline, investors
- `contact.html` — Contact / support form
- `privacy.html` — Privacy Policy
- `terms.html` — Terms & Conditions
- `help.html` — Help Centre with interactive FAQ accordion
- `404.html` — Custom branded "page not found" page (GitHub Pages serves this automatically for broken links)
- `sitemap.xml` / `robots.txt` — SEO crawling files
- `assets/logo-color.png` — Logo for light/white backgrounds (used in nav)
- `assets/logo-white.png` — Logo for dark backgrounds (used in footer)

**Important:** keep the `assets` folder in the same directory as the HTML files when deploying — all pages reference `assets/logo-color.png` and `assets/logo-white.png`.

## Deploy on GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: `main` branch, root folder (`/`)
4. Save — site will be live at `https://<username>.github.io/<repo>/`

## Custom domain (tezzo.co.in)
1. In repo root, create a file named `CNAME` containing exactly:
   ```
   tezzo.co.in
   ```
2. At your domain registrar (where you bought tezzo.co.in), add DNS records:
   - **A records** pointing `@` to GitHub Pages IPs:
     185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - **CNAME record**: `www` → `<username>.github.io`
3. In GitHub repo → Settings → Pages → Custom domain → enter `tezzo.co.in` → Save
4. Enable "Enforce HTTPS" once DNS propagates (can take up to 24-48 hrs)

## Notes
- All pages share one design system (colors, fonts, nav, footer) defined inline.
- Fonts: Plus Jakarta Sans (headings) + Inter (body), loaded from Google Fonts CDN.
- Favicon is generated from the Tezzo logo (the "T" mark) — see `assets/favicon*.png` and `assets/favicon.ico`.

## ⚠️ Action needed: Connect Google Analytics
Every page already includes the GA4 tracking snippet with a placeholder ID (`G-XXXXXXXXXX`). To start tracking real visitors:
1. Go to [analytics.google.com](https://analytics.google.com), create a free account/property for `tezzo.co.in`
2. Copy your Measurement ID (looks like `G-ABC1234XYZ`)
3. Find and replace **every** occurrence of `G-XXXXXXXXXX` across all HTML files with your real ID (each page has it twice — once in the script `src` URL, once in `gtag('config', ...)`)
4. Re-upload the updated files to GitHub
5. Visit your site, then check Google Analytics → Reports → Realtime to confirm tracking works
The contact form (`contact.html`) currently points to a placeholder Formspree endpoint and will fall back to opening the visitor's email app if it's not configured. To make it send real emails to your inbox:
1. Go to [formspree.io](https://formspree.io) and sign up free
2. Create a new form, get your Form ID (looks like `xeqpqgnz`)
3. Open `contact.html`, find this line near the top of the form:
   ```html
   <form id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
4. Replace `YOUR_FORM_ID` with your real Formspree ID and re-upload the file
5. Formspree's free plan supports 50 submissions/month, which is enough to start
