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
});
