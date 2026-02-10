document.addEventListener("DOMContentLoaded", () => {
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

    // header now scrolls naturally; no sticky/auto-hide behavior

    const aboutTrigger = document.querySelector(".easter-egg-trigger");
    let confettiRunning = false;
    let aboutClickCount = 0;
    let aboutClickTimer = null;

    const launchConfetti = () => {
        if (confettiRunning) {
            return;
        }
        confettiRunning = true;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            window.location.href = "easter-egg.html";
            return;
        }

        const container = document.createElement("div");
        container.className = "confetti-container";

        const colors = ["#00c4cc", "#78ffa8", "#ffb347", "#ff6b6b", "#5aa9ff"];
        const totalPieces = 320;
        const upwardPieces = 160;

        for (let i = 0; i < totalPieces; i += 1) {
            const piece = document.createElement("span");
            const depth = i % 3;
            piece.className = `confetti-piece depth-${depth + 1}`;
            const x = Math.random() * 100;
            const rotation = Math.floor(Math.random() * 360);
            const delay = Math.random() * 220;
            const size = depth === 0 ? 10 + Math.random() * 8 : depth === 1 ? 7 + Math.random() * 6 : 5 + Math.random() * 4;
            const duration = depth === 0 ? 1500 : depth === 1 ? 1700 : 1900;
            const drift = (Math.random() - 0.5) * (depth === 0 ? 140 : depth === 1 ? 100 : 70);
            const scale = depth === 0 ? 1 : depth === 1 ? 0.85 : 0.7;

            piece.style.left = `${x}%`;
            piece.style.background = colors[i % colors.length];
            piece.style.setProperty("--confetti-x", `${(Math.random() - 0.5) * 30}px`);
            piece.style.setProperty("--confetti-drift", `${drift}px`);
            piece.style.setProperty("--confetti-scale", scale);
            piece.style.setProperty("--confetti-rotate", `${rotation}deg`);
            piece.style.width = `${size}px`;
            piece.style.height = `${size * 1.6}px`;
            piece.style.animationDelay = `${delay}ms`;
            piece.style.animationDuration = `${duration}ms`;

            container.appendChild(piece);
        }

        for (let i = 0; i < upwardPieces; i += 1) {
            const piece = document.createElement("span");
            const depth = i % 3;
            piece.className = `confetti-piece is-upward depth-${depth + 1}`;
            const x = Math.random() * 100;
            const rotation = Math.floor(Math.random() * 360);
            const delay = Math.random() * 220;
            const size = depth === 0 ? 10 + Math.random() * 8 : depth === 1 ? 7 + Math.random() * 6 : 5 + Math.random() * 4;
            const duration = depth === 0 ? 1500 : depth === 1 ? 1700 : 1900;
            const drift = (Math.random() - 0.5) * (depth === 0 ? 140 : depth === 1 ? 100 : 70);
            const scale = depth === 0 ? 1 : depth === 1 ? 0.85 : 0.7;

            piece.style.left = `${x}%`;
            piece.style.background = colors[i % colors.length];
            piece.style.setProperty("--confetti-x", `${(Math.random() - 0.5) * 30}px`);
            piece.style.setProperty("--confetti-drift", `${drift}px`);
            piece.style.setProperty("--confetti-scale", scale);
            piece.style.setProperty("--confetti-rotate", `${rotation}deg`);
            piece.style.width = `${size}px`;
            piece.style.height = `${size * 1.6}px`;
            piece.style.animationDelay = `${delay}ms`;
            piece.style.animationDuration = `${duration}ms`;

            container.appendChild(piece);
        }

        document.body.appendChild(container);

        setTimeout(() => {
            document.body.classList.add("page-fade");
        }, 900);

        setTimeout(() => {
            container.remove();
            window.location.href = "easter-egg.html";
        }, 1400);
    };

    const handleAboutActivation = () => {
        if (confettiRunning) {
            return;
        }

        aboutClickCount += 1;
        if (aboutClickCount === 1) {
            if (aboutClickTimer) {
                clearTimeout(aboutClickTimer);
            }
            aboutClickTimer = setTimeout(() => {
                aboutClickCount = 0;
            }, 700);
            return;
        }

        if (aboutClickTimer) {
            clearTimeout(aboutClickTimer);
            aboutClickTimer = null;
        }
        aboutClickCount = 0;
        launchConfetti();
    };

    if (aboutTrigger) {
        aboutTrigger.addEventListener("click", handleAboutActivation);
        aboutTrigger.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleAboutActivation();
            }
        });
    }
});
