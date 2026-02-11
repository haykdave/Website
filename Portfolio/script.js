document.addEventListener("DOMContentLoaded", () => {
    const syncHeaderOffset = () => {
        const header = document.querySelector("header");
        if (!header) {
            return;
        }
        document.documentElement.style.setProperty(
            "--header-offset",
            `${Math.ceil(header.getBoundingClientRect().height)}px`
        );
    };

    const initHeroScrollEffect = () => {
        const stage = document.getElementById("page-transition-stage");
        const hero = document.getElementById("welcome-hero");
        const nextPagePanel = document.getElementById("next-page-panel");
        const technicalSection = nextPagePanel
            ? nextPagePanel.querySelector(".technical-section")
            : document.querySelector(".technical-section");
        const technicalSkillItems = technicalSection
            ? Array.from(technicalSection.querySelectorAll(".skill-item"))
            : [];
        const technicalTitle = technicalSection
            ? technicalSection.querySelector("h2")
            : null;
        const technicalTitleFullText = technicalTitle
            ? technicalTitle.textContent.trim()
            : "";
        if (!stage || !hero || !nextPagePanel) {
            return;
        }

        if (technicalTitle) {
            technicalTitle.textContent = "";
        }
        let ticking = false;

        const updateHeroEffect = () => {
            const rect = stage.getBoundingClientRect();
            const scrollRange = Math.max(rect.height - window.innerHeight, 1);
            const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1);
            const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
            const collapseProgress = clamp((progress - 0.22) / 0.28, 0, 1);
            const hardCutProgress = collapseProgress * collapseProgress * collapseProgress;
            const overwriteProgress = clamp((progress - 0.01) / 0.18, 0, 1);
            const overwriteEase = 1 - Math.pow(1 - overwriteProgress, 3);

            const translateY = progress * window.innerHeight * 0.62;
            const scale = 1 - progress * 0.42;
            const opacity = Math.max(1 - progress * 1.65, 0);
            const blur = progress * 0.9;
            const cut = hardCutProgress * 100;
            const edgeOpacity = clamp((progress - 0.18) / 0.12, 0, 1);

            hero.style.transform = `translateY(${translateY}px) scale(${scale})`;
            hero.style.opacity = String(opacity);
            hero.style.filter = `blur(${blur}px)`;
            hero.style.setProperty("--hero-cut", `${cut}%`);
            hero.style.setProperty("--hero-edge-opacity", String(edgeOpacity));
            hero.style.pointerEvents = opacity <= 0.02 ? "none" : "";

            const nextCut = (1 - overwriteEase) * 100;
            const nextTranslateY = (1 - overwriteEase) * 60;
            const nextOpacity = clamp((progress - 0.01) / 0.065, 0, 1);
            nextPagePanel.style.setProperty("--next-cut", `${nextCut}%`);
            nextPagePanel.style.transform = `translateY(${nextTranslateY}px)`;
            nextPagePanel.style.opacity = String(nextOpacity);
            nextPagePanel.style.pointerEvents = overwriteProgress > 0.9 ? "auto" : "none";

            if (technicalSection) {
                const revealProgress = overwriteEase;
                const technicalTranslateY = (1 - revealProgress) * 36;
                technicalSection.style.opacity = String(clamp(revealProgress * 1.15, 0, 1));
                technicalSection.style.transform = `translateY(${technicalTranslateY}px)`;

                if (technicalTitle && technicalTitleFullText) {
                    const panelRect = nextPagePanel.getBoundingClientRect();
                    const visibleFromBottom = window.innerHeight - panelRect.top;
                    const typingProgress = clamp(
                        visibleFromBottom / (window.innerHeight * 0.72),
                        0,
                        1
                    );
                    const charsToShow = Math.round(
                        typingProgress * technicalTitleFullText.length
                    );
                    technicalTitle.textContent = technicalTitleFullText.slice(0, charsToShow);

                    if (technicalSkillItems.length > 0) {
                        technicalSkillItems.forEach((item, index) => {
                            const staggerDelay = index * 0.14;
                            const itemProgress = clamp(
                                (typingProgress - staggerDelay) / 0.48,
                                0,
                                1
                            );
                            const easedProgress = 1 - Math.pow(1 - itemProgress, 2.4);
                            const translateY = (1 - easedProgress) * 40;
                            const translateX = (1 - easedProgress) * 8;
                            item.style.opacity = String(easedProgress);
                            item.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
                        });
                    }
                }
            }

            ticking = false;
        };

        const requestTick = () => {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(updateHeroEffect);
        };

        window.addEventListener("scroll", requestTick, { passive: true });
        window.addEventListener("resize", requestTick);
        requestTick();
    };

    const createSiteIdentity = () => {
        const host = document.querySelector(".site-header");
        if (!host || host.querySelector(".site-identity")) {
            return;
        }

        const identity = document.createElement("div");
        identity.className = "site-identity";

        const name = document.createElement("span");
        name.className = "site-name";
        name.textContent = "HAYK DAVTYAN";

        const email = document.createElement("a");
        email.className = "site-email";
        email.href = "mailto:hayk.davtyan@hotmail.com";
        email.setAttribute("aria-label", "hayk.davtyan@hotmail.com, AVAIBLE FOR WORK");

        const emailDefault = document.createElement("span");
        emailDefault.className = "site-email-default";
        emailDefault.textContent = "HAYK.DAVTYAN@HOTMAIL.COM";

        const emailHover = document.createElement("span");
        emailHover.className = "site-email-hover";
        emailHover.textContent = "AVAIBLE FOR WORK";

        email.appendChild(emailDefault);
        email.appendChild(emailHover);

        identity.appendChild(name);
        identity.appendChild(email);
        host.prepend(identity);
    };

    createSiteIdentity();
    syncHeaderOffset();
    window.addEventListener("resize", syncHeaderOffset);

    const applyTheme = (theme) => {
        const isDark = theme === "dark";
        document.documentElement.classList.toggle("theme-dark", isDark);
        document.documentElement.classList.toggle("theme-light", !isDark);
        document.body.classList.toggle("theme-dark", isDark);
        document.body.classList.toggle("theme-light", !isDark);
    };

    const getStoredTheme = () => localStorage.getItem("theme-preference");
    const storedTheme = getStoredTheme();
    applyTheme(storedTheme === "dark" ? "dark" : "light");

    const createThemeToggle = () => {
        const host = document.querySelector(".site-header") || document.querySelector("header");
        if (!host) {
            return null;
        }

        const existingButton = host.querySelector(".theme-toggle");
        if (existingButton) {
            return existingButton;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-toggle";
        button.setAttribute("aria-live", "polite");
        host.appendChild(button);
        return button;
    };

    const themeToggle = createThemeToggle();
    const syncThemeToggleLabel = () => {
        if (!themeToggle) {
            return;
        }
        const isDark = document.body.classList.contains("theme-dark");
        const nextLabel = isDark ? "Light mode" : "Dark mode";
        const icon = isDark ? "☀️" : "🌙";
        themeToggle.innerHTML =
            `<span class="theme-toggle-icon" aria-hidden="true">${icon}</span><span>${nextLabel}</span>`;
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute("aria-label", nextLabel);
    };

    if (themeToggle) {
        syncThemeToggleLabel();
        themeToggle.addEventListener("click", () => {
            const isDark = document.body.classList.contains("theme-dark");
            const nextTheme = isDark ? "light" : "dark";
            applyTheme(nextTheme);
            localStorage.setItem("theme-preference", nextTheme);
            syncThemeToggleLabel();
        });
    }

    const loader = document.getElementById("loader");
    const hasSeenLoader = sessionStorage.getItem("seenLoader") === "true";
    if (!loader || hasSeenLoader) {
        if (loader) {
            loader.remove();
        }
        document.body.classList.add("is-loaded");
    }

    const percentText = loader ? loader.querySelector(".loader-percent") : null;
    const battery = loader ? loader.querySelector(".battery") : null;
    const cells = loader ? Array.from(loader.querySelectorAll(".battery-cell")) : [];

    const steps = [0, 33, 66, 100];
    const stepDelayMs = 900;
    let stepIndex = 0;

    const showStep = () => {
        const value = steps[stepIndex];
        if (percentText) {
            percentText.textContent = `${value}%`;
        }
        if (battery) {
            battery.setAttribute("aria-valuenow", value);
        }

        if (cells.length > 0) {
            const activeCells = Math.round(value / 33);
            cells.forEach((cell, index) => {
                cell.classList.toggle("is-active", index < activeCells);
            });
        }

        if (value === 100) {
            if (loader) {
                setTimeout(() => {
                    loader.classList.add("is-hidden");
                    document.body.classList.add("is-loaded");

                    setTimeout(() => loader.remove(), 600);
                }, 400);
            }
            return;
        }

        stepIndex++;
        setTimeout(showStep, stepDelayMs);
    };

    if (loader && !hasSeenLoader) {
        showStep();
        sessionStorage.setItem("seenLoader", "true");
    }

    const form = document.getElementById("contact-form");
    if (form) {
        const successMessage = form.querySelector(".contact-success");

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { Accept: "application/json" },
                });

                if (response.ok) {
                    form.reset();
                    if (successMessage) {
                        successMessage.classList.add("is-visible");
                    }
                    return;
                }
            } catch (error) {
                // fall through to error message
            }

            if (successMessage) {
                successMessage.textContent =
                    "Sorry, something went wrong. Please try again.";
                successMessage.classList.add("is-visible");
            }
        });
    }

    initHeroScrollEffect();

    // header now scrolls naturally; no sticky/auto-hide behavior
});
