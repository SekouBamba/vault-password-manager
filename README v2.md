# Vault Password Manager

## Objective
- Provide a browser-based password manager that helps users generate strong passwords and store them securely.
- Offer an interface that keeps the generator and vault management workflows focused yet easy to switch between.

## Requirements
- Modern web browser with JavaScript.
- Must be able to save and store passwords.
- Must be able to let the user create saves for the passwords and site they belong too.
- Must let the user copy and paste said passwords
- Must be able to generate passwords according to the specifications of the user.
## Non-Funcational Requirements
- Run over `http://` or `https://` to allow clipboard access without browser security warnings.

## User Stories
- **As a user**, I want to generate a random password of different lengths and character types so I can create strong credentials.
- **As a user**, I want to copy the generated password to my clipboard so that I can paste it into sign-up forms.
- **As a user**, I want to store my password entries with a site label, username, and password so I can keep track of my logins.
- **As a user**, I want to reveal or hide stored passwords so that I can check them without exposing them.
- **As a user**, I want to delete individual entries or clear the entire vault so that I can remove outdated or compromised credentials.
- **As a user**, I want to switch between generator and vault views quickly so that the interface stays uncluttered.

## Implementation Details
- Built with a single-page HTML layout, modular CSS styling, and JavaScript for interactivity.
- Uses tab controls to separate the generator and manager panels.
- Password generation guarantees inclusion of selected character sets and shuffles results for added entropy.
- Entries persist in `localStorage`, enabling offline use and automatic reload of saved credentials.
- Clipboard interactions leverage the modern Clipboard API with a fallback to `document.execCommand`.

## Deliverables
- `index.html`: single-page interface with tab navigation, generator form, and vault manager.
- `styles.css`: responsive layouts and component styling.
- `script.js`: logic for tab switching, password generation, vault persistence, clipboard actions, and status messaging.
- `README.md`: project description, summary of design and project.
- `UI Design`: design concepts to show how the app will look and feel.
