document.addEventListener("DOMContentLoaded", () => {
    const MOBILE_BREAKPOINT = 768;

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
        if (!stage || !hero) {
            return;
        }

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        let renderedProgress = 0;
        let targetProgress = 0;
        let rafId = 0;
        let previousTime = 0;

        const computeTargetProgress = () => {
            const rect = stage.getBoundingClientRect();
            const headerOffset =
                parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue(
                        "--header-offset"
                    )
                ) || 0;
            const scrollRange = Math.max(window.innerHeight * 0.95, 1);
            const scrolledIntoStage = headerOffset - rect.top;
            const rawProgress = clamp(scrolledIntoStage / scrollRange, 0, 1);
            return 1 - Math.pow(1 - rawProgress, 1.12);
        };

        const paintHero = (progress) => {
            const collapseProgress = clamp((progress - 0.18) / 0.3, 0, 1);
            const hardCutProgress = collapseProgress * collapseProgress * collapseProgress;

            const translateY = progress * window.innerHeight * 0.5;
            const scale = 1 - progress * 0.32;
            const opacity = Math.max(1 - progress * 1.32, 0);
            const blur = progress * 0.7;
            const cut = hardCutProgress * 100;
            const edgeOpacity = clamp(progress / 0.22, 0, 1);

            hero.style.transform = `translateY(${translateY}px) scale(${scale})`;
            hero.style.opacity = String(opacity);
            hero.style.filter = `blur(${blur}px)`;
            hero.style.setProperty("--hero-cut", `${cut}%`);
            hero.style.setProperty("--hero-edge-opacity", String(edgeOpacity));
            hero.style.pointerEvents = opacity <= 0.04 ? "none" : "";
        };

        const animateHero = (time) => {
            if (previousTime === 0) {
                previousTime = time;
            }

            const deltaSeconds = Math.max((time - previousTime) / 1000, 0);
            previousTime = time;

            // Faster response while scrolling up so hero reappears earlier.
            const isRevealing = targetProgress < renderedProgress;
            const damping = isRevealing ? 24 : 14;
            const followFactor = 1 - Math.exp(-damping * deltaSeconds);
            renderedProgress += (targetProgress - renderedProgress) * followFactor;

            if (Math.abs(targetProgress - renderedProgress) < 0.0008) {
                renderedProgress = targetProgress;
            }

            paintHero(renderedProgress);

            if (renderedProgress !== targetProgress) {
                rafId = window.requestAnimationFrame(animateHero);
                return;
            }

            rafId = 0;
            previousTime = 0;
        };

        const requestTick = () => {
            targetProgress = computeTargetProgress();
            if (rafId !== 0) {
                return;
            }
            rafId = window.requestAnimationFrame(animateHero);
        };

        const syncHeroImmediately = () => {
            if (rafId !== 0) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
            previousTime = 0;
            targetProgress = computeTargetProgress();
            renderedProgress = targetProgress;
            paintHero(renderedProgress);
        };

        window.addEventListener("scroll", requestTick, { passive: true });
        window.addEventListener("resize", requestTick);
        window.addEventListener("hero:sync-immediate", syncHeroImmediately);
        requestTick();
    };

    const initTechnicalTitleTyping = () => {
        const technicalSection = document.querySelector(".technical-section");
        if (!technicalSection) {
            return;
        }

        const technicalTitle = technicalSection.querySelector("h2");
        if (!technicalTitle) {
            return;
        }

        const fullText = technicalTitle.textContent.trim();
        if (!fullText) {
            return;
        }

        let lastChars = -1;
        let ticking = false;

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const updateTitleByScroll = () => {
            const rect = technicalSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight || 1;
            const scrollTop = window.scrollY || window.pageYOffset || 0;
            const doc = document.documentElement;
            const scrollBottom = scrollTop + viewportHeight;
            const isAtPageBottom = scrollBottom >= doc.scrollHeight - 2;

            const start = viewportHeight * 0.88;
            const end = viewportHeight * 0.2;
            const total = Math.max(start - end, 1);
            const scrollProgress = clamp((start - rect.top) / total, 0, 1);
            const progress = isAtPageBottom ? 1 : scrollProgress;
            const charsToShow = Math.round(progress * fullText.length);

            if (charsToShow !== lastChars) {
                technicalTitle.textContent = fullText.slice(0, charsToShow);
                lastChars = charsToShow;
            }
            ticking = false;
        };

        const requestTick = () => {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(updateTitleByScroll);
        };

        technicalTitle.textContent = "";
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
        emailHover.textContent = "AVAILABLE FOR WORK";

        email.appendChild(emailDefault);
        email.appendChild(emailHover);

        identity.appendChild(name);
        identity.appendChild(email);
        host.prepend(identity);
    };

    createSiteIdentity();
    syncHeaderOffset();
    window.addEventListener("resize", syncHeaderOffset);

    const homeLinks = document.querySelectorAll('.site-links a[href="#welcome-hero"]');
    homeLinks.forEach((homeLink) => {
        homeLink.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "auto" });
            window.requestAnimationFrame(() => {
                window.dispatchEvent(new Event("hero:sync-immediate"));
            });
        });
    });

    const mailLinks = document.querySelectorAll('a[href^="mailto:"]');
    mailLinks.forEach((mailLink) => {
        mailLink.addEventListener("click", (event) => {
            const href = mailLink.getAttribute("href");
            if (!href) {
                return;
            }
            event.preventDefault();
            window.location.href = href;
        });
    });

    const applyTheme = (theme) => {
        const isDark = theme === "dark";
        document.documentElement.classList.toggle("theme-dark", isDark);
        document.documentElement.classList.toggle("theme-light", !isDark);
        document.body.classList.toggle("theme-dark", isDark);
        document.body.classList.toggle("theme-light", !isDark);
    };

    const getStoredTheme = () => localStorage.getItem("theme-preference");
    const storedTheme = getStoredTheme();
    applyTheme(storedTheme === "light" ? "light" : "dark");

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

    const createMobileMenuToggle = () => {
        const host = document.querySelector(".site-header");
        if (!host) {
            return null;
        }

        const existingButton = host.querySelector(".site-mobile-menu-toggle");
        if (existingButton) {
            return existingButton;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "site-mobile-menu-toggle";
        button.textContent = "MENU";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Toggle header menu");
        host.prepend(button);
        return button;
    };

    const mobileMenuToggle = createMobileMenuToggle();
    const siteHeader = document.querySelector(".site-header");

    const setMobileMenuOpen = (isOpen) => {
        if (!siteHeader || !mobileMenuToggle) {
            return;
        }
        siteHeader.classList.toggle("is-mobile-menu-open", isOpen);
        mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
        syncHeaderOffset();
    };

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener("click", () => {
            if (!siteHeader) {
                return;
            }
            const isOpen = siteHeader.classList.contains("is-mobile-menu-open");
            setMobileMenuOpen(!isOpen);
        });
    }

    if (siteHeader) {
        siteHeader.addEventListener("click", (event) => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                return;
            }
            if (!(event.target instanceof Element)) {
                return;
            }
            const clickedAction = event.target.closest("a, .theme-toggle");
            if (!clickedAction) {
                return;
            }
            setMobileMenuOpen(false);
        });
    }

    document.addEventListener("click", (event) => {
        if (window.innerWidth > MOBILE_BREAKPOINT || !siteHeader) {
            return;
        }
        const isOpen = siteHeader.classList.contains("is-mobile-menu-open");
        if (!isOpen || siteHeader.contains(event.target)) {
            return;
        }
        setMobileMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !siteHeader) {
            return;
        }
        if (!siteHeader.classList.contains("is-mobile-menu-open")) {
            return;
        }
        setMobileMenuOpen(false);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            setMobileMenuOpen(false);
        } else {
            syncHeaderOffset();
        }
    });

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
    initTechnicalTitleTyping();

    // header now scrolls naturally; no sticky/auto-hide behavior
});
