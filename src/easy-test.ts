import { Component, DebugElement, Provider, Type } from '@angular/core';
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
  whenInput( input : object | string, inputValue? : any ) {
    if ( typeof input === 'string' ) {
      this.component[ input ] = inputValue;
    } else {
      Object.keys(input).forEach(inputKey => {
        this.component[ inputKey ] = input[ inputKey ];
      });
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
     * Set input value and dispatch custom event
     * @param {HTMLElement} input
     * @param {string} value
     */
  dispatchInputEvent(input: HTMLElement, value: string) {
    if (input instanceof HTMLInputElement) {
      (<HTMLInputElement>input).value = value;
      input.dispatchEvent(newEvent('input'));
      this.detectChanges();
    }
    else {
      console.warn(`Element ${input} should be HTMLInputElement`);
    }
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
  testedDe : DebugElement;
  testedElement: HTMLElement;

  /**
   * Run detect changes on the host component
   */
  detectChangesHost() {
    this.hostFixture.detectChanges();
  }

}

/**
 * Create factory-function for tested component
 * @param testedType
 * @param moduleMetadata
 */
export function makeCreateComponent<T>(testedType : Type<T>, moduleMetadata : TestModuleMetadata = {} ) {

  beforeEach(() => {
    jasmine.addMatchers(customMatchers);
  });

  beforeEach(async( () => {
    const declarations = [testedType];
    if (moduleMetadata && moduleMetadata.declarations) {
      declarations.push(...moduleMetadata.declarations);
    }

    TestBed.configureTestingModule({...moduleMetadata, declarations: declarations}).compileComponents();
  }));

  return () : EasyTest<T> => {
    const easyTest = new EasyTest<T>();
    easyTest.fixture = TestBed.createComponent(testedType);
    easyTest.fixture.detectChanges();
    easyTest.debugElement = easyTest.fixture.debugElement;
    // The component instance
    easyTest.component = easyTest.debugElement.componentInstance;
    // The component native element
    easyTest.element = easyTest.debugElement.nativeElement;
    return easyTest;
  }
}

@Component({selector: 'host-for-test', template: ''})
export class HostComponent {
}

export function makeCreateHostComponent<T, H = HostComponent>( testedType : Type<T>, hostType : Type<H> = HostComponent as Type<H>, moduleMetadata : TestModuleMetadata = {} ) {

  beforeEach( () => {
    jasmine.addMatchers(customMatchers);
  });

  beforeEach(async( () => {
    const declarations = [ testedType, hostType ];
    if ( moduleMetadata && moduleMetadata.declarations ) {
      declarations.push(...moduleMetadata.declarations);
    }
    TestBed.configureTestingModule({...moduleMetadata, declarations: declarations});
  }));

  return ( template: string, styles?: any ) : EasyTestWithHost<T, H> => {
    TestBed.overrideComponent(hostType, {set: {template: template, styles: styles || []}});
    const eastTest = new EasyTestWithHost<T, H>();
    eastTest.hostFixture = TestBed.createComponent(hostType);
    eastTest.hostFixture.detectChanges();
    //  The host component instance
    eastTest.hostComponent = eastTest.hostFixture.componentInstance;
    eastTest.debugElement = eastTest.hostFixture.debugElement;
    eastTest.element = eastTest.hostFixture.nativeElement;
    // The tested component debug element
    eastTest.testedDe = eastTest.hostFixture.debugElement.query(By.directive(testedType));
    // The tested component instance, rendered inside the host
    eastTest.component = eastTest.testedDe.componentInstance;
    eastTest.testedElement = eastTest.testedDe.nativeElement;

    return eastTest;
  }
}

export class EasyTestService<S> {
  service : S
}

/**
 *
 * @param service
 * @param moduleMetadata
 */
export function testService<S>( service : Type<S>, moduleMetadata : TestModuleMetadata = {} ): EasyTestService<S> {

  const providers : Provider[] = [ {provide: service, useClass: service} ];

  if ( moduleMetadata && moduleMetadata.providers ) {
    providers.push(...moduleMetadata.providers);
  }

  TestBed.configureTestingModule({
    providers
  });

  const easyTest = new EasyTestService<S>();

  easyTest.service = TestBed.get(service);

  return easyTest;
}
