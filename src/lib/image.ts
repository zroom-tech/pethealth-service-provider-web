/**
 * 이미지 압축 & 정사각형 크롭 유틸
 * - 중앙 기준 정사각형 크롭
 * - 100KB 이하로 압축 (quality 단계적 감소)
 * - 최대 해상도 1024x1024
 */

const MAX_SIZE = 1024;
const TARGET_BYTES = 100 * 1024; // 100KB

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function cropAndResizeToSquare(
  img: HTMLImageElement,
  size: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // 중앙 기준 정사각형 크롭
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;

  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality,
    );
  });
}

/** File → 정사각형 크롭 + 100KB 이하 압축 → File 반환 */
export async function compressImage(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const side = Math.min(img.naturalWidth, img.naturalHeight, MAX_SIZE);
    const canvas = cropAndResizeToSquare(img, side);

    // quality를 낮춰가며 100KB 이하 달성
    let quality = 0.9;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > TARGET_BYTES && quality > 0.1) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, quality);
    }

    // 그래도 크면 해상도를 줄임
    if (blob.size > TARGET_BYTES) {
      let reduced = side;
      while (blob.size > TARGET_BYTES && reduced > 128) {
        reduced = Math.floor(reduced * 0.7);
        const smaller = cropAndResizeToSquare(img, reduced);
        blob = await canvasToBlob(smaller, 0.7);
      }
    }

    const name = file.name.replace(/\.[^.]+$/, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 여러 File을 일괄 압축 */
export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
