export function trimCanvas(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return canvas;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height).data;

    let top = 0, bottom = height, left = 0, right = width;
    let found = false;

    // Buscar el borde superior
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (imageData[(y * width + x) * 4 + 3] !== 0) {
                top = y;
                found = true;
                break;
            }
        }
        if (found) break;
    }

    // Borde inferior
    found = false;
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            if (imageData[(y * width + x) * 4 + 3] !== 0) {
                bottom = y;
                found = true;
                break;
            }
        }
        if (found) break;
    }

    // Borde izquierdo
    found = false;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (imageData[(y * width + x) * 4 + 3] !== 0) {
                left = x;
                found = true;
                break;
            }
        }
        if (found) break;
    }

    // Borde derecho
    found = false;
    for (let x = width - 1; x >= 0; x--) {
        for (let y = 0; y < height; y++) {
            if (imageData[(y * width + x) * 4 + 3] !== 0) {
                right = x;
                found = true;
                break;
            }
        }
        if (found) break;
    }

    const trimmedWidth = right - left + 1;
    const trimmedHeight = bottom - top + 1;

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;
    const trimmedCtx = trimmedCanvas.getContext('2d', { willReadFrequently: true });

    if (trimmedCtx) {
        trimmedCtx.drawImage(
            canvas,
            left, top, trimmedWidth, trimmedHeight, // origen
            0, 0, trimmedWidth, trimmedHeight        // destino
        );
    }

    return trimmedCanvas;
}