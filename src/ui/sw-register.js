import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
    onNeedRefresh() {
        const shouldUpdate = confirm("Hay una nueva versión disponible. ¿Recargar?");
        if (shouldUpdate) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log("App lista para trabajar offline");
    },
});
