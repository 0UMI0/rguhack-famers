const form = document.getElementById("echo-form");
const responseBox = document.getElementById("response");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = document.getElementById("message").value.trim();
    if (!message) return;

    try {
        const res = await fetch("/api/echo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });
        if (!res.ok) {
            responseBox.textContent = `Error: server returned ${res.status}.`;
            responseBox.classList.remove("hidden");
            return;
        }
        const data = await res.json();
        responseBox.textContent = `Echo: ${data.echo}`;
        responseBox.classList.remove("hidden");
    } catch (err) {
        responseBox.textContent = "Error: could not reach the server.";
        responseBox.classList.remove("hidden");
    }
});
