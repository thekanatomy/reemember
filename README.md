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
- **Binder** – card grid, search, tag filters; rarity = relationship strength, ♥ bar = relationship health
- **Card detail** – where/when you met, editable notes, socials, history, log a touch
- **Follow-up** – overdue queue based on per-person cadence, draft message + one-tap open socials
- **Places** – people grouped by where you met them
- **Add** – fake "scan" + manual form
- **Tools** – Weekly 5, message writer, intro matchmaker, CSV export, reset

## Next steps
Real card/QR scanning (camera + OCR), contacts import, push reminders, map view with geolocation, backend + auth, React/React Native port.
