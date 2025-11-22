"use strict";

(function () {
    // Keys/defaults for stored vault data and generator.
    const STORAGE_KEY = "passwordVaultEntries";
    const THEME_KEY = "passwordVaultTheme";
    const DEFAULT_LENGTH = 16;

    // DOM nodes
    const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
    const panels = Array.from(document.querySelectorAll(".panel"));
    const generatedPasswordInput = document.getElementById("generatedPassword");
    const copyGeneratedButton = document.getElementById("copyGenerated");
    const generatorForm = document.getElementById("generatorOptions");
    const lengthSlider = document.getElementById("lengthSlider");
    const lengthValue = document.getElementById("lengthValue");
    const includeLowercase = document.getElementById("includeLowercase");
    const includeUppercase = document.getElementById("includeUppercase");
    const includeNumbers = document.getElementById("includeNumbers");
    const includeSymbols = document.getElementById("includeSymbols");

    const saveForm = document.getElementById("saveForm");
    const entryLabelInput = document.getElementById("entryLabel");
    const entryUsernameInput = document.getElementById("entryUsername");
    const entryPasswordInput = document.getElementById("entryPassword");
    const togglePasswordVisibilityButton = document.getElementById("togglePasswordVisibility");
    const useGeneratedButton = document.getElementById("useGenerated");
    const statusMessage = document.getElementById("statusMessage");

    const clearAllButton = document.getElementById("clearAll");
    const entriesList = document.getElementById("entries");
    const emptyStateMessage = document.getElementById("emptyState");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const settingsDeleteButton = document.getElementById("settingsDelete");
    const vaultSlider = document.getElementById("vaultSlider");
    const vaultIndicatorRow = document.getElementById("vaultIndicatorRow");
    const vaultDots = vaultIndicatorRow ? Array.from(vaultIndicatorRow.querySelectorAll(".dot")) : [];
    const vaultSlides = vaultSlider ? Array.from(vaultSlider.querySelectorAll(".vault-slide")) : [];

    let entries = [];

    // Display status feedback.
    function showStatus(message, type) {
        if (!statusMessage) {
            return;
        }
        statusMessage.textContent = message;
        statusMessage.classList.remove("success", "error");
        if (type === "success") {
            statusMessage.classList.add("success");
        } else if (type === "error") {
            statusMessage.classList.add("error");
        }
    }

    // Toggle dark/light theme classes.
    function applyTheme(theme) {
        const useDark = theme === "dark";
        document.body.classList.toggle("dark-theme", useDark);
        if (darkModeToggle) {
            darkModeToggle.checked = useDark;
        }
        try {
            localStorage.setItem(THEME_KEY, useDark ? "dark" : "light");
        } catch (error) {
            console.warn("Unable to store theme preference:", error);
        }
    }

    // Restore theme preference from storage.
    function initializeTheme() {
        let storedTheme = null;
        try {
            storedTheme = localStorage.getItem(THEME_KEY);
        } catch (error) {
            console.warn("Unable to read theme preference:", error);
        }
        if (storedTheme === "dark") {
            applyTheme("dark");
        } else {
            applyTheme("light");
        }
    }

    // Swap panels and maintain tab.
    function activateTab(target) {
        tabButtons.forEach((button) => {
            const isActive = button.dataset.tab === target;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", isActive ? "true" : "false");
            button.setAttribute("tabindex", isActive ? "0" : "-1");
        });

        panels.forEach((panel) => {
            const isActive = panel.dataset.panel === target;
            panel.classList.toggle("active", isActive);
            if (isActive) {
                panel.removeAttribute("hidden");
            } else {
                panel.setAttribute("hidden", "");
            }
        });
    }

    // Build a random password following the selected character sets and length.
    function generatePassword(options) {
        const characterSets = [];
        if (options.lowercase) {
            characterSets.push("abcdefghijklmnopqrstuvwxyz");
        }
        if (options.uppercase) {
            characterSets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        }
        if (options.numbers) {
            characterSets.push("0123456789");
        }
        if (options.symbols) {
            characterSets.push("!@#$%^&*()-_=+[]{};:,.<>?/|");
        }

        if (!characterSets.length) {
            throw new Error("Choose at least one character type.");
        }

        const allCharacters = characterSets.join("");
        const passwordCharacters = [];

        // Guarantee one character from each selected set for better entropy.
        characterSets.forEach((set) => {
            passwordCharacters.push(randomChar(set));
        });

        for (let i = passwordCharacters.length; i < options.length; i += 1) {
            passwordCharacters.push(randomChar(allCharacters));
        }

        return passwordCharacters.join("");
    }

    // Picks a single character from the provided alphabet.
    function randomChar(characters) {
        const index = Math.floor(Math.random() * characters.length);
        return characters.charAt(index);
    }

    // Load entries from local storage.
    function loadEntries() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            entries = raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn("Unable to load entries:", error);
            entries = [];
        }
    }

    // Save entries back to storage and surface issues to the UI.
    function persistEntries() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (error) {
            console.warn("Unable to save entries:", error);
            showStatus("Could not save to local storage.", "error");
        }
    }

    // Rebuild the vault list along with empty state.
    function renderEntries() {
        entriesList.innerHTML = "";
        if (!entries.length) {
            emptyStateMessage.style.display = "block";
            return;
        }

        emptyStateMessage.style.display = "none";
        entries.forEach((entry) => {
            const listItem = document.createElement("li");
            listItem.className = "entry";
            listItem.dataset.id = entry.id;

            const header = document.createElement("div");
            header.className = "entry-header";

            const title = document.createElement("h3");
            title.className = "entry-title";
            title.textContent = entry.label;

            const meta = document.createElement("div");
            meta.className = "entry-meta";

            const usernameSpan = document.createElement("span");
            usernameSpan.textContent = entry.username;

            const createdSpan = document.createElement("span");
            createdSpan.textContent = formatDate(entry.createdAt);

            meta.appendChild(usernameSpan);
            meta.appendChild(createdSpan);
            header.appendChild(title);
            header.appendChild(meta);

            const passwordContainer = document.createElement("div");
            passwordContainer.className = "entry-password";

            const passwordField = document.createElement("input");
            passwordField.type = "password";
            passwordField.value = entry.password;
            passwordField.readOnly = true;

            const toggleButton = document.createElement("button");
            toggleButton.type = "button";
            toggleButton.textContent = "Show";
            toggleButton.addEventListener("click", () => {
                const isHidden = passwordField.type === "password";
                passwordField.type = isHidden ? "text" : "password";
                toggleButton.textContent = isHidden ? "Hide" : "Show";
            });

            passwordContainer.appendChild(passwordField);
            passwordContainer.appendChild(toggleButton);

            const actions = document.createElement("div");
            actions.className = "entry-actions";

            const copyButton = document.createElement("button");
            copyButton.type = "button";
            copyButton.textContent = "Copy";
            copyButton.addEventListener("click", () => {
                copyToClipboard(entry.password)
                    .then(() => showStatus(`Copied password for ${entry.label}.`, "success"))
                    .catch(() => showStatus("Clipboard copy failed.", "error"));
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                deleteEntry(entry.id);
            });

            actions.appendChild(copyButton);
            actions.appendChild(deleteButton);

            listItem.appendChild(header);
            listItem.appendChild(passwordContainer);
            listItem.appendChild(actions);

            entriesList.appendChild(listItem);
        });
    }

    // Create a timestamp for when each entry was saved.
    function formatDate(timestamp) {
        const formatter = new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        return `Saved ${formatter.format(new Date(timestamp))}`;
    }

    // Prefer crypto UUIDs but fall back to a timestamp/random-based id.
    function createEntryId() {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
        const randomPart = Math.random().toString(36).slice(2, 8);
        return `entry-${Date.now()}-${randomPart}`;
    }

    // Insert new entries at the top.
    function addEntry(entry) {
        entries.unshift(entry);
        persistEntries();
        renderEntries();
    }

    // Remove an entry by id, updating the UI and showing feedback.
    function deleteEntry(id) {
        const index = entries.findIndex((entry) => entry.id === id);
        if (index === -1) {
            showStatus("Entry not found.", "error");
            return;
        }
        entries.splice(index, 1);
        persistEntries();
        renderEntries();
        showStatus("Entry deleted.", "success");
    }

    // Read generator options, create a password, and surface any validation issues.
    function handleGeneratorSubmit(event) {
        event.preventDefault();

        const options = {
            length: Number(lengthSlider.value) || DEFAULT_LENGTH,
            lowercase: includeLowercase.checked,
            uppercase: includeUppercase.checked,
            numbers: includeNumbers.checked,
            symbols: includeSymbols.checked
        };

        try {
            const password = generatePassword(options);
            generatedPasswordInput.value = password;
            showStatus("Generated a new password. Use the \"Use Generated\" button in the Vault tab. ", "success");
        } catch (error) {
            showStatus(error.message, "error");
        }
    }

    // Check vault form inputs, build an entry object, and store it.
    function handleSaveSubmit(event) {
        event.preventDefault();
        const label = entryLabelInput.value.trim();
        const username = entryUsernameInput.value.trim();
        const password = entryPasswordInput.value;

        if (!label || !username || !password) {
            showStatus("Fill in every field before saving.", "error");
            return;
        }

        const entry = {
            id: createEntryId(),
            label,
            username,
            password,
            createdAt: Date.now()
        };

        addEntry(entry);
        saveForm.reset();
        lengthSlider.value = lengthSlider.value || DEFAULT_LENGTH;
        togglePasswordVisibilityButton.textContent = "Show";
        entryPasswordInput.type = "password";
        showStatus(`Saved ${label} to your vault.`, "success");
    }

    // Remove saved password after a confirm prompt.
    function clearVaultEntries() {
        if (!entries.length) {
            showStatus("Vault is already empty.", "error");
            return;
        }
        const confirmed = confirm("Remove every saved password? This cannot be undone.");
        if (!confirmed) {
            return;
        }
        entries = [];
        persistEntries();
        renderEntries();
        showStatus("Vault cleared.", "success");
    }

    // Wire scroll/resize/click handlers so the marketing slider stays in sync.
    function bindVaultSlider() {
        if (!vaultSlider || !vaultSlides.length || !vaultDots.length) {
            return;
        }

        const updateActiveIndicator = () => {
            const sliderRect = vaultSlider.getBoundingClientRect();
            let closestIndex = 0;
            let smallestDistance = Number.POSITIVE_INFINITY;
            vaultSlides.forEach((slide, index) => {
                const rect = slide.getBoundingClientRect();
                const distance = Math.abs(rect.left - sliderRect.left);
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestIndex = index;
                }
            });
            setActiveVaultDot(closestIndex);
        };

        let ticking = false;
        vaultSlider.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveIndicator();
                    ticking = false;
                });
                ticking = true;
            }
        });

        window.addEventListener("resize", updateActiveIndicator);

        vaultDots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                const target = vaultSlides[index];
                if (!target) {
                    return;
                }
                vaultSlider.scrollTo({
                    left: target.offsetLeft - vaultSlider.offsetLeft,
                    behavior: "smooth"
                });
            });
        });

        updateActiveIndicator();
    }

    // Register all UI event handlers for generator, tabs, forms, and settings.
    function attachEventListeners() {
        generatorForm.addEventListener("submit", handleGeneratorSubmit);

        tabButtons.forEach((button, index) => {
            button.addEventListener("click", () => {
                activateTab(button.dataset.tab);
                button.focus();
            });

            button.addEventListener("keydown", (event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                    return;
                }
                event.preventDefault();
                const increment = event.key === "ArrowRight" ? 1 : -1;
                const nextIndex = (index + increment + tabButtons.length) % tabButtons.length;
                const nextButton = tabButtons[nextIndex];
                activateTab(nextButton.dataset.tab);
                nextButton.focus();
            });
        });

        lengthSlider.addEventListener("input", () => {
            lengthValue.textContent = lengthSlider.value;
        });

        copyGeneratedButton.addEventListener("click", () => {
            copyToClipboard(generatedPasswordInput.value)
                .then(() => showStatus("Generated password copied.", "success"))
                .catch(() => showStatus("Nothing to copy.", "error"));
        });

        useGeneratedButton.addEventListener("click", () => {
            if (!generatedPasswordInput.value) {
                showStatus("Generate a password first.", "error");
                return;
            }
            entryPasswordInput.value = generatedPasswordInput.value;
            showStatus("Password applied to the form.", "success");
        });

        togglePasswordVisibilityButton.addEventListener("click", () => {
            const hidden = entryPasswordInput.type === "password";
            entryPasswordInput.type = hidden ? "text" : "password";
            togglePasswordVisibilityButton.textContent = hidden ? "Hide" : "Show";
        });

        saveForm.addEventListener("submit", handleSaveSubmit);

        clearAllButton.addEventListener("click", clearVaultEntries);

        if (settingsDeleteButton) {
            settingsDeleteButton.addEventListener("click", clearVaultEntries);
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener("change", () => {
                applyTheme(darkModeToggle.checked ? "dark" : "light");
            });
        }
    }

    // Kick everything off once the DOM is ready.
    function init() {
        initializeTheme();
        activateTab("generator");
        statusMessage.textContent = "";
        lengthValue.textContent = String(lengthSlider.value || DEFAULT_LENGTH);
        loadEntries();
        renderEntries();
        attachEventListeners();
        bindVaultSlider();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
