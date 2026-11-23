# AMIS Center – demo website

One-page demo for AMIS Center (Toul Kork, Phnom Penh) in English, French and Khmer.
Plain HTML/CSS/JS, so it needs no build step or database.

## Files
- `index.html` – page structure
- `assets/css/style.css` – design (brand colour `--papaya: #FF8000` at the top)
- `assets/js/i18n.js` – **all text in EN / FR / KM, plus courses, prices and class times**. Edit content here.
- `assets/js/main.js` – language switch, mobile menu, demo form
- `assets/img/logo.png` – logo

- `assets/js/config.js` – **email keys and level-test times**
- `email-templates/` – the two emails to paste into EmailJS

## Turn on real emails (EmailJS, free: 200 emails/month)
Until the keys are filled in, the form works in demo mode and shows a note that nothing was sent.
Each request uses 1 email (to the school) or 2 (school + student confirmation).

1. Sign up at https://www.emailjs.com (free).
2. **Email Services → Add New Service → Gmail**, sign in with the school's Gmail. Copy the **Service ID**.
3. **Email Templates → Create New Template**, twice, using the files in `email-templates/`
   (the subject / To / Reply-To settings are written at the top of each file). Copy both **Template IDs**.
4. **Account → General**: copy the **Public Key**.
5. Paste the four values into `assets/js/config.js`.
6. **Account → Security**: add your site address (e.g. `https://<your-username>.github.io`) as an allowed origin,
   so nobody else can use your keys.
7. Push to GitHub, open the live site and send a test request.

## Level test times
Edit `levelTest` in `assets/js/config.js`: which weekdays have tests, at which times, and how many days ahead to show.
The form shows the level-test step only for language courses.

## Preview locally
Open `index.html` in a browser.

## Publish on GitHub Pages
1. Create a new repository on GitHub, e.g. `amis-center-demo` (public).
2. Upload all files (keep the `assets` folder structure), or push with git:
   ```
   git remote add origin https://github.com/<your-username>/amis-center-demo.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.
4. After a minute the site is live at `https://<your-username>.github.io/amis-center-demo/`.

## Placeholders to replace before showing as final
- Phone, Telegram, Facebook and exact address
- Prices (marked as examples on the page)
- Course levels, lengths and class times
- Khmer and French wording should be checked by a native speaker
