/// <reference types="vite/client" />

// Type declarations for third-party modules
declare module "papaparse" {
  export interface ParseError {
    type: string
    code: string
    message: string
    row?: number
  }

  export interface ParseResult<T> {
    data: T[]
    errors: ParseError[]
    meta: {
      delimiter: string
      linebreak: string
      aborted: boolean
      truncated: boolean
      cursor: number
      fields?: string[]
    }
  }

  export interface ParseConfig<T> {
    delimiter?: string
    newline?: string
    quoteChar?: string
    escapeChar?: string
    header?: boolean
    transformHeader?: (header: string) => string
    dynamicTyping?: boolean
    preview?: number
    encoding?: string
    worker?: boolean
    comments?: boolean | string
    step?: (results: ParseResult<T>, parser: any) => void
    complete?: (results: ParseResult<T>) => void
    error?: (error: Error) => void
    download?: boolean
    skipEmptyLines?: boolean
    fastMode?: boolean
    transform?: (value: string, field: string | number) => any
  }

  export function parse<T = any>(
    input: string | File | Blob,
    config?: ParseConfig<T>
  ): ParseResult<T>

  const Papa: {
    parse: typeof parse
    Parser: any
    unparse: (data: any[], config?: any) => string
    LocalChunkSize: string
    RemoteChunkSize: string
    DefaultDelimiter: string
    BadDelimiter: RegExp
    WORKERS_SUPPORTED: boolean
    SCRIPT_PATH: string
  }

  export default Papa
}
