import { Provider, Type } from '@angular/core';
export interface CompatibleSpy extends jasmine.Spy {
    /** By chaining the spy with and.returnValue, all calls to the function will return a specific
     * value. */
    andReturn(val: any): void;
    /** By chaining the spy with and.callFake, all calls to the spy will delegate to the supplied
     * function. */
    andCallFake(fn: Function): CompatibleSpy;
    /** removes all recorded calls */
    reset(): any;
}
export declare type SpyObject<T> = T & {
    [P in keyof T]: T[P] & CompatibleSpy;
};
export declare function createSpyObject<T>(type: Type<T>): SpyObject<T>;
export declare function mockProvider<T>(type: Type<T>): Provider;
