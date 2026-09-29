# Reemember — prototype

Collect people like trading cards. Remember where you met, keep their socials one tap away, and never drop a follow-up.

## Run it
No build step. In VS Code, install **Live Server** and right-click `index.html` → *Open with Live Server*
(or just open `index.html` in a browser). On desktop it renders as a phone frame; resize/open on your phone for full-screen.

## Files
- `index.html` — app shell (top bar, tab bar, sheet)
- `styles.css` — theme + card visuals (holo shine on Rare+)
- `data.js` — sample people, card types, rarity, social link builders
- `app.js` — state (localStorage), views, detail sheet, tools

## What's in the prototype
Two tabs and a big **+** in the middle. Light (white) and dark mode: follows the system, with a sun/moon toggle at the top to override.
- **People** – a circular deck of Pokémon-proportioned (5:7) cards. Front card is large and gently hovers; the rest fan out behind. Swipe or use ← → to browse, tap to open. Each card's colors are sampled from that person's photo. Dots = bond (1–5).
- **Person** – big card, stats (Bond, Last spoke, Touches), where/when you met, notes, links, Message / Call / Email, reminder cadence.
- **Follow up** – who's waiting to hear from you, with a suggested message.
- **+ (center button)** – opens the camera immediately to scan an Instagram / LinkedIn profile or business card. The card is created automatically; you just say where you met. **Swipe right** for the manual form.

> The scan is simulated: it uses the camera preview but returns sample profiles. A real version sends the photo to a vision/OCR model (e.g. Claude's vision API) from a backend and pulls the profile picture.

## Next steps
Real card/QR scanning (camera + OCR), contacts import, push reminders, map view with geolocation, backend + auth, React/React Native port.
