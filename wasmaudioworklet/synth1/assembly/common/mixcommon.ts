export function createInstrumentArray<T>(length: i32, factoryFunc: () => T): T[] {
    const arr = new Array<T>(length);
    for(let n  = 0; n < length;n++) {
        arr[n] = factoryFunc();
    }
    return arr;
}
