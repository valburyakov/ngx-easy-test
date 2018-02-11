import { Component, DebugElement, InjectionToken, NO_ERRORS_SCHEMA, Provider, Type } from '@angular/core';
import { async, ComponentFixture, TestBed, TestModuleMetadata, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { customMatchers } from './easy-test.matchers';
import { newEvent } from './utils';

// T = Tested component
export class EasyTest<T> {
  fixture : ComponentFixture<T>;
  debugElement : DebugElement;
  component : T;
  element : HTMLElement | any;

  /**
   * Wrapper for TestBed.get()
   */
  get<V>(type: Type<V> | InjectionToken<V>): any {
    return TestBed.get(type);
  }

  /**
   * Run detect changes on the host component
   */
  detectChanges() {
    this[ 'hostFixture' ] ? this[ 'hostFixture' ].detectChanges() : this.fixture.detectChanges();
  }

  /**
   * Query a DOM element from the tested element
   * @param selector
   * @returns {any}
   */
  query( selector : string ) {
    return this.element.querySelector(selector);
  }

  /**
   * Query a DOM elements from the tested element
   * @param selector
   * @returns {any}
   */
  queryAll( selector : string ) {
    return this.element.querySelectorAll(selector);
  }

  /**
   *
   * @param input
   * @param inputValue
   */
  whenInput( input : Partial<T> | string, inputValue? : any ) {
    if ( typeof input === 'string' ) {
      this.component[ input ] = inputValue;
    } else {
      for (let p in input) {
        this.component[p] = input[p];
      }
    }

    this.detectChanges();
  }

  /**
   *
   * @param output
   * @param cb
   */
  whenOutput<T>( output : string, cb : ( result : T ) => any ) {
    const observable = this.component[ output ];
    if ( typeof observable.subscribe === 'function' ) {
      observable.subscribe(result => cb(result));
    } else {
      throw new Error(`${output} in not an @Output`);
    }
  }

  /**
   * Trigger event on the element via DebugElement.triggerEventHandler()
   * @param event
   * @param selector
   * @param eventObj
   */
  trigger( event : string, selector : string | DebugElement, eventObj = null ) {
    let element = selector;
    if ( typeof selector === 'string' ) {
       element = this.debugElement.query(By.css(selector));
    }
    if ( !element ) {
      console.warn(`Element ${selector} does not exists`);
    } else {
      (element as DebugElement).triggerEventHandler(event, eventObj);
      this.detectChanges();
    }
  }

    /**
     * Dispatch custom DOM event the old fashioned way
     * @param {HTMLElement} element
     * @param {string} eventName
     */
  dispatchCustomEvent(element: HTMLElement, eventName: string) {
    element.dispatchEvent(newEvent(eventName));
    this.detectChanges();
  }

  /** Wait a tick then detect changes */
  advance() {
    tick();
    this.detectChanges();
  }

}

export class EasyTestWithHost<T, H = HostComponent> extends EasyTest<T> {
  hostComponent : H;
  hostFixture : ComponentFixture<H>;
  hostElement: HTMLElement;
  testedDe : DebugElement;

  /**
   * Run detect changes on the host component
   */
  detectChangesHost() {
    this.hostFixture.detectChanges();
  }

}

/**
 * Create factory-function for tested component
 * @param component - testedType
 * @param shallow - use NO_ERRORS_SCHEMA
 * @param moduleMetadata
 */
export function makeTestComponentFactory<T>({
       component,
       shallow = true,
       ...moduleMetadata
     }: TestModuleMetadata &
    {
      component: Type<T>;
      shallow?: boolean;
    }) {

  beforeEach(() => {
    jasmine.addMatchers(customMatchers);
  });

  beforeEach( async(() => {
    const declarations = [component];
    if (moduleMetadata && moduleMetadata.declarations) {
      declarations.push(...moduleMetadata.declarations);
    }

    TestBed.configureTestingModule({
        ...moduleMetadata,
        schemas: [shallow ? NO_ERRORS_SCHEMA : []],
        declarations: declarations
    }).compileComponents();
  }));

  return (componentParameters: Partial<T> = {}, detectChanges = true) => {
    const easyTest = new EasyTest<T>();
    easyTest.fixture = TestBed.createComponent(component);
    easyTest.debugElement = easyTest.fixture.debugElement;
    // The component instance
    easyTest.component = easyTest.debugElement.componentInstance;
    // The component native element
    easyTest.element = easyTest.debugElement.nativeElement;
    for (let p in componentParameters) {
        easyTest.component[p] = componentParameters[p];
    }
    if (detectChanges) {
      easyTest.fixture.detectChanges();
    }
    return easyTest;
  }
}

@Component({selector: 'host-for-test', template: ''})
export class HostComponent {
}

export function makeHostComponentFactory<T, H = HostComponent>({
    tested,
    host = HostComponent as Type<H>,
    ...moduleMetadata }: TestModuleMetadata & {
    tested: Type<T>,
    host?: Type<H>,
  }) {

  beforeEach( () => {
    jasmine.addMatchers(customMatchers);
  });

  beforeEach( () => {
    const declarations = [ tested, host ];
    if ( moduleMetadata && moduleMetadata.declarations ) {
      declarations.push(...moduleMetadata.declarations);
    }
    TestBed.configureTestingModule({...moduleMetadata, declarations: declarations});
  });

  return ( template: string, styles?: any ) => {
    TestBed.overrideComponent(host, {set: {template: template, styles: styles || []}});
    const eastTest = new EasyTestWithHost<T, H>();
    eastTest.hostFixture = TestBed.createComponent(host);
    eastTest.hostFixture.detectChanges();
    //  The host component instance
    eastTest.hostComponent = eastTest.hostFixture.componentInstance;
    eastTest.debugElement = eastTest.hostFixture.debugElement;
    eastTest.hostElement = eastTest.hostFixture.nativeElement;
    // The tested component debug element
    eastTest.testedDe = eastTest.hostFixture.debugElement.query(By.directive(tested));
    // The tested component instance, rendered inside the host
    eastTest.component = eastTest.testedDe.componentInstance;
    eastTest.element = eastTest.testedDe.nativeElement;

    return eastTest;
  }
}

export interface EasyTestService<S> {
  service : S
}

/**
 *
 * @param service
 * @param moduleMetadata
 */
export function createServiceFixture<S>(
    { service, ...moduleMetadata } : TestModuleMetadata & {service: Type<S> } ): EasyTestService<S> {

  const providers : Provider[] = [ {provide: service, useClass: service} ];

  if ( moduleMetadata && moduleMetadata.providers ) {
    providers.push(...moduleMetadata.providers);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...moduleMetadata,
      providers
    });
  });

  return {
    get service() {
      return TestBed.get(service);
    }
  };
}
