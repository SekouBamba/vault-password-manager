# Vault Password Manager (Prototype)

This is a client-side prototype for a simple password manager built for a class project.
It demonstrates password generation, local (browser) storage of entries, copy-to-clipboard,
and a small settings panel (dark mode, export/import).

## Files
- `index.html` — single-page UI with tabs (Generator, Vault, Settings)
- `styles.css` — basic responsive styling and dark mode
- `script.js` — application logic (password generation, localStorage vault, clipboard)
- `README.md` — this file

## How to run
1. Clone the repo or download the files.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox).
3. Use the **Generator** tab to create a password, then save it to the **Vault**.
4. All data persists in `localStorage` — no backend required.

## Notes & Next steps
- This prototype stores passwords unencrypted in `localStorage` intentionally for demo purposes.
  For any real-world usage, implement encryption (e.g., encrypt vault with a master password).
- Consider adding import/export via secure key management and stronger UX for deletion/backup.
