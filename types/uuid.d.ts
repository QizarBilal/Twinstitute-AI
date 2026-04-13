declare module 'uuid' {
  export function v4(): string
  export function v4(options?: any, buffer?: any, offset?: number): string
  export function validate(uuid: string): boolean
  export function version(uuid: string): number
  export function parse(uuid: string): Uint8Array
  export function stringify(bytes: Uint8Array | number[]): string
  export namespace v4 {
    function parse(uuid: string): Uint8Array
    function stringify(bytes: Uint8Array | number[]): string
    function validate(uuid: string): boolean
  }
}
