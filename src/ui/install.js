export function initInstallPrompt() {
    let deferredPrompt;
    const header = document.querySelector('header');

    // Crear botón (oculto por defecto)
    const btn = document.createElement('button');
    btn.textContent = "Instalar App";
    btn.className = "btn primary";
    btn.style.display = "none";
    btn.style.marginLeft = "auto"; // Push to right if in flex container
    btn.id = "installBtn";

    // Insertar en header si existe, o en body
    if (header) {
        // Si el header tiene una estructura de flex, esto debería funcionar bien
        const row = header.querySelector('.row') || header;
        row.appendChild(btn);
    } else {
        document.body.prepend(btn);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir que el navegador muestre su mini-infobar automático (opcional, pero buena práctica si hacemos UI propia)
        e.preventDefault();
        deferredPrompt = e;

        // Mostrar nuestro botón
        btn.style.display = "inline-block";
        console.log("Install prompt captured");

        btn.onclick = async () => {
            // Ocultar botón
            btn.style.display = "none";
            // Mostrar prompt nativo
            deferredPrompt.prompt();
            // Esperar resultado
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
        };
    });

    window.addEventListener('appinstalled', () => {
        btn.style.display = "none";
        deferredPrompt = null;
        console.log('PWA was installed');
    });
}
