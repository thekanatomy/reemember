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
Two tabs, one add button. Light and dark mode follow the system.
- **People** – clean list, search, and a Recent / Places toggle (where you met each person)
- **Person** – who they are, where/when you met, your notes, links, one-tap Message / Call / Email, reminder cadence, "Mark as contacted"
- **Follow up** – who's waiting to hear from you, with a suggested message and one tap to send
- **New person (+)** – scan a business card (demo) or type it in

## Next steps
Real card/QR scanning (camera + OCR), contacts import, push reminders, map view with geolocation, backend + auth, React/React Native port.
