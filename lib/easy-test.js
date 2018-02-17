"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const testing_1 = require("@angular/core/testing");
const platform_browser_1 = require("@angular/platform-browser");
const easy_test_matchers_1 = require("./easy-test.matchers");
const utils_1 = require("./utils");
// T = Tested component
class EasyTest {
    /**
     * Wrapper for TestBed.get()
     */
    get(type) {
        return testing_1.TestBed.get(type);
    }
    /**
     * Run detect changes on the host component
     */
    detectChanges() {
        this['hostFixture'] ? this['hostFixture'].detectChanges() : this.fixture.detectChanges();
    }
    /**
     * Query a DOM element from the tested element
     * @param selector
     * @returns {any}
     */
    query(selector) {
        return this.element.querySelector(selector);
    }
    /**
     * Query a DOM elements from the tested element
     * @param selector
     * @returns {any}
     */
    queryAll(selector) {
        return this.element.querySelectorAll(selector);
    }
    /**
     *
     * @param input
     * @param inputValue
     */
    whenInput(input, inputValue) {
        if (typeof input === 'string') {
            this.component[input] = inputValue;
        }
        else {
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
    whenOutput(output, cb) {
        const observable = this.component[output];
        if (typeof observable.subscribe === 'function') {
            observable.subscribe(result => cb(result));
        }
        else {
            throw new Error(`${output} in not an @Output`);
        }
    }
    /**
     * Trigger event on the element via DebugElement.triggerEventHandler()
     * @param event
     * @param selector
     * @param eventObj
     */
    trigger(event, selector, eventObj = null) {
        let element = selector;
        if (typeof selector === 'string') {
            element = this.debugElement.query(platform_browser_1.By.css(selector));
        }
        if (!element) {
            console.warn(`Element ${selector} does not exists`);
        }
        else {
            element.triggerEventHandler(event, eventObj);
            this.detectChanges();
        }
    }
    /**
     * Dispatch custom DOM event the old fashioned way
     * @param {HTMLElement} element
     * @param {string} eventName
     */
    dispatchCustomEvent(element, eventName) {
        element.dispatchEvent(utils_1.newEvent(eventName));
        this.detectChanges();
    }
    /** Wait a tick then detect changes */
    advance() {
        testing_1.tick();
        this.detectChanges();
    }
}
exports.EasyTest = EasyTest;
class EasyTestWithHost extends EasyTest {
    /**
     * Run detect changes on the host component
     */
    detectChangesHost() {
        this.hostFixture.detectChanges();
    }
}
exports.EasyTestWithHost = EasyTestWithHost;
/**
 * Create factory-function for tested component
 * @param component - testedType
 * @param shallow - use NO_ERRORS_SCHEMA
 * @param moduleMetadata
 */
function makeTestComponentFactory(_a) {
    var { component, shallow = true } = _a, moduleMetadata = __rest(_a, ["component", "shallow"]);
    beforeEach(() => {
        jasmine.addMatchers(easy_test_matchers_1.customMatchers);
    });
    beforeEach(testing_1.async(() => {
        const declarations = [component];
        if (moduleMetadata && moduleMetadata.declarations) {
            declarations.push(...moduleMetadata.declarations);
        }
        testing_1.TestBed.configureTestingModule(Object.assign({}, moduleMetadata, { schemas: [shallow ? core_1.NO_ERRORS_SCHEMA : []], declarations: declarations })).compileComponents();
    }));
    return (componentParameters = {}, detectChanges = true) => {
        const easyTest = new EasyTest();
        easyTest.fixture = testing_1.TestBed.createComponent(component);
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
    };
}
exports.makeTestComponentFactory = makeTestComponentFactory;
let HostComponent = class HostComponent {
};
HostComponent = __decorate([
    core_1.Component({ selector: 'host-for-test', template: '' })
], HostComponent);
exports.HostComponent = HostComponent;
function makeHostComponentFactory(_a) {
    var { tested, host = HostComponent } = _a, moduleMetadata = __rest(_a, ["tested", "host"]);
    beforeEach(() => {
        jasmine.addMatchers(easy_test_matchers_1.customMatchers);
    });
    beforeEach(() => {
        const declarations = [tested, host];
        if (moduleMetadata && moduleMetadata.declarations) {
            declarations.push(...moduleMetadata.declarations);
        }
        testing_1.TestBed.configureTestingModule(Object.assign({}, moduleMetadata, { declarations: declarations }));
    });
    return (template, styles) => {
        testing_1.TestBed.overrideComponent(host, { set: { template: template, styles: styles || [] } });
        const eastTest = new EasyTestWithHost();
        eastTest.hostFixture = testing_1.TestBed.createComponent(host);
        eastTest.hostFixture.detectChanges();
        //  The host component instance
        eastTest.hostComponent = eastTest.hostFixture.componentInstance;
        eastTest.debugElement = eastTest.hostFixture.debugElement;
        eastTest.hostElement = eastTest.hostFixture.nativeElement;
        // The tested component debug element
        eastTest.testedDe = eastTest.hostFixture.debugElement.query(platform_browser_1.By.directive(tested));
        // The tested component instance, rendered inside the host
        eastTest.component = eastTest.testedDe.componentInstance;
        eastTest.element = eastTest.testedDe.nativeElement;
        return eastTest;
    };
}
exports.makeHostComponentFactory = makeHostComponentFactory;
/**
 *
 * @param service
 * @param moduleMetadata
 */
function createServiceFixture(_a) {
    var { service } = _a, moduleMetadata = __rest(_a, ["service"]);
    const providers = [{ provide: service, useClass: service }];
    if (moduleMetadata && moduleMetadata.providers) {
        providers.push(...moduleMetadata.providers);
    }
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule(Object.assign({}, moduleMetadata, { providers }));
    });
    return {
        get service() {
            return testing_1.TestBed.get(service);
        }
    };
}
exports.createServiceFixture = createServiceFixture;
