import qrcode from "qrcode-generator";
export interface QrMatrix {
  n: number;
  dark: (r: number, c: number) => boolean;
}
export function qrMatrix(text: string): QrMatrix | null {
  try {
    const q = qrcode(0, "H");
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    return { n, dark: (r, c) => q.isDark(r, c) };
  } catch {
    return null;
  }
}
