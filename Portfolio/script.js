document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const percentText = loader.querySelector(".loader-percent");
    const battery = loader.querySelector(".battery");
    const cells = Array.from(loader.querySelectorAll(".battery-cell"));

    const steps = [0, 33, 66, 100];
    const stepDelayMs = 900;
    let stepIndex = 0;

    const showStep = () => {
        const value = steps[stepIndex];
        percentText.textContent = `${value}%`;
        battery.setAttribute("aria-valuenow", value);

        const activeCells = Math.round(value / 33);
        cells.forEach((cell, index) => {
            cell.classList.toggle("is-active", index < activeCells);
        });

        if (value === 100) {
            setTimeout(() => {
                loader.classList.add("is-hidden");
                document.body.classList.add("is-loaded");

                setTimeout(() => loader.remove(), 600);
            }, 400);
            return;
        }

        stepIndex++;
        setTimeout(showStep, stepDelayMs);
    };

    showStep();

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
