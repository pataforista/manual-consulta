/**
 * Utility for Mobile Bottom Sheets
 * Allows showing content in a push-up sheet instead of a modal.
 */

let sheetEl = null;
let overlayEl = null;

export function initBottomSheet() {
    if (document.getElementById('bottomSheet')) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'sheetOverlay';
    overlayEl.className = 'sheet-overlay';
    overlayEl.onclick = closeBottomSheet;

    sheetEl = document.createElement('div');
    sheetEl.id = 'bottomSheet';
    sheetEl.className = 'bottom-sheet';
    sheetEl.innerHTML = `
    <div class="sheet-handle"></div>
    <div id="sheetContent" class="sheet-content"></div>
  `;

    document.body.appendChild(overlayEl);
    document.body.appendChild(sheetEl);

    // Bind Gestures if ZingTouch is available
    if (window.ZingTouch) {
        const region = new ZingTouch.Region(sheetEl);
        region.bind(sheetEl, 'swipe', (e) => {
            const data = e.detail.data[0];
            // Close on swipe down (angles around 90 deg in ZingTouch usually)
            if (data.currentDirection > 60 && data.currentDirection < 120) {
                closeBottomSheet();
            }
        });
    }
}

export function openBottomSheet(html) {
    if (!sheetEl) initBottomSheet();

    document.getElementById('sheetContent').innerHTML = html;
    overlayEl.classList.add('active');
    sheetEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeBottomSheet() {
    if (!sheetEl) return;
    overlayEl.classList.remove('active');
    sheetEl.classList.remove('active');
    document.body.style.overflow = '';
}
