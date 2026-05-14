// AssemblyScript built-in types for IDE / language-server hover and
// autocomplete. The AS compiler ignores this file (it has its own type
// system); only TypeScript / the editor's TS server reads it.

declare type i8 = number;
declare type i16 = number;
declare type i32 = number;
declare type i64 = number;
declare type isize = number;
declare type u8 = number;
declare type u16 = number;
declare type u32 = number;
declare type u64 = number;
declare type usize = number;
declare type f32 = number;
declare type f64 = number;
declare type bool = boolean;

declare class StaticArray<T> {
    constructor(length: number);
    static fromArray<T>(arr: T[]): StaticArray<T>;
    readonly length: i32;
    [n: i32]: T;
}

declare namespace Mathf {
    const PI: f32;
    const E: f32;
    function abs(v: f32): f32;
    function min(a: f32, b: f32): f32;
    function max(a: f32, b: f32): f32;
    function floor(v: f32): f32;
    function ceil(v: f32): f32;
    function round(v: f32): f32;
    function sign(v: f32): f32;
    function trunc(v: f32): f32;
    function sin(v: f32): f32;
    function cos(v: f32): f32;
    function tan(v: f32): f32;
    function asin(v: f32): f32;
    function acos(v: f32): f32;
    function atan(v: f32): f32;
    function atan2(y: f32, x: f32): f32;
    function exp(v: f32): f32;
    function exp2(v: f32): f32;
    function log(v: f32): f32;
    function log2(v: f32): f32;
    function log10(v: f32): f32;
    function pow(a: f32, b: f32): f32;
    function sqrt(v: f32): f32;
    function cbrt(v: f32): f32;
    function hypot(a: f32, b: f32): f32;
    function sinh(v: f32): f32;
    function cosh(v: f32): f32;
    function tanh(v: f32): f32;
    function random(): f32;
}

declare function changetype<T>(value: any): T;
declare function load<T>(ptr: usize, offset?: usize): T;
declare function store<T>(ptr: usize, value: T, offset?: usize): void;
declare function min<T>(a: T, b: T): T;
declare function max<T>(a: T, b: T): T;
declare function abs<T>(v: T): T;
declare function unchecked<T>(v: T): T;
declare function memory_size(): i32;
declare function memory_grow(pages: i32): i32;
declare function nativeSizeof<T>(): u32;
