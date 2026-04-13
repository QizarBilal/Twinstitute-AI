declare module 'qrcode' {
  interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    type?: 'image/png' | 'image/jpeg' | 'image/webp'
    quality?: number
    margin?: number
    width?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  export function toDataURL(
    data: string | any[],
    options?: QRCodeToDataURLOptions | string
  ): Promise<string>

  export function toCanvas(
    canvas: HTMLCanvasElement,
    data: string | any[],
    options?: QRCodeToDataURLOptions
  ): Promise<void>

  export function toString(
    data: string | any[],
    options?: QRCodeToDataURLOptions & { type?: 'svg' }
  ): Promise<string>
}
