export function initInstallPrompt() {
    let deferredPrompt;

    const existing = document.getElementById("installBtn");
    const btn = existing || document.createElement("button");
    btn.textContent = "Instalar App";
    btn.className = "btn primary no-print";
    btn.style.display = "none";
    btn.style.position = "fixed";
    btn.style.right = "16px";
    btn.style.bottom = "84px";
    btn.style.zIndex = "1200";
    btn.id = "installBtn";

    if (!existing) document.body.appendChild(btn);

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        btn.style.display = "inline-block";

        btn.onclick = async () => {
            if (!deferredPrompt) return;
            btn.style.display = "none";
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
        };
    });

    window.addEventListener("appinstalled", () => {
        btn.style.display = "none";
        deferredPrompt = null;
    });
}
