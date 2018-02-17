import { DebugElement, InjectionToken, Type } from '@angular/core';
import { ComponentFixture, TestModuleMetadata } from '@angular/core/testing';
export declare class EasyTest<T> {
    fixture: ComponentFixture<T>;
    debugElement: DebugElement;
    component: T;
    element: HTMLElement | any;
    /**
     * Wrapper for TestBed.get()
     */
    get<V>(type: Type<V> | InjectionToken<V>): any;
    /**
     * Run detect changes on the host component
     */
    detectChanges(): void;
    /**
     * Query a DOM element from the tested element
     * @param selector
     * @returns {any}
     */
    query(selector: string): any;
    /**
     * Query a DOM elements from the tested element
     * @param selector
     * @returns {any}
     */
    queryAll(selector: string): any;
    /**
     *
     * @param input
     * @param inputValue
     */
    whenInput(input: Partial<T> | string, inputValue?: any): void;
    /**
     *
     * @param output
     * @param cb
     */
    whenOutput<T>(output: string, cb: (result: T) => any): void;
    /**
     * Trigger event on the element via DebugElement.triggerEventHandler()
     * @param event
     * @param selector
     * @param eventObj
     */
    trigger(event: string, selector: string | DebugElement, eventObj?: any): void;
    /**
     * Dispatch custom DOM event the old fashioned way
     * @param {HTMLElement} element
     * @param {string} eventName
     */
    dispatchCustomEvent(element: HTMLElement, eventName: string): void;
    /** Wait a tick then detect changes */
    advance(): void;
}
export declare class EasyTestWithHost<T, H = HostComponent> extends EasyTest<T> {
    hostComponent: H;
    hostFixture: ComponentFixture<H>;
    hostElement: HTMLElement;
    testedDe: DebugElement;
    /**
     * Run detect changes on the host component
     */
    detectChangesHost(): void;
}
/**
 * Create factory-function for tested component
 * @param component - testedType
 * @param shallow - use NO_ERRORS_SCHEMA
 * @param moduleMetadata
 */
export declare function makeTestComponentFactory<T>({component, shallow, ...moduleMetadata}: TestModuleMetadata & {
    component: Type<T>;
    shallow?: boolean;
}): (componentParameters?: Partial<T>, detectChanges?: boolean) => EasyTest<T>;
export declare class HostComponent {
}
export declare function makeHostComponentFactory<T, H = HostComponent>({tested, host, ...moduleMetadata}: TestModuleMetadata & {
    tested: Type<T>;
    host?: Type<H>;
}): (template: string, styles?: any) => EasyTestWithHost<T, H>;
export interface EasyTestService<S> {
    service: S;
}
/**
 *
 * @param service
 * @param mocks
 * @param moduleMetadata
 */
export declare function createServiceFixture<S>({service, mocks, ...moduleMetadata}: TestModuleMetadata & {
    service: Type<S>;
    mocks?: Type<any>[];
}): EasyTestService<S>;
