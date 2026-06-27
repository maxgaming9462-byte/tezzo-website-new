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
- No backend — forms are front-end only (contact form shows a success message but does not send email yet).
- Fonts: Plus Jakarta Sans (headings) + Inter (body), loaded from Google Fonts CDN.
