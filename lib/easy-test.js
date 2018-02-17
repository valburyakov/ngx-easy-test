"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var core_1 = require("@angular/core");
var testing_1 = require("@angular/core/testing");
var platform_browser_1 = require("@angular/platform-browser");
var easy_test_matchers_1 = require("./easy-test.matchers");
var utils_1 = require("./utils");
var mock_1 = require("./mock");
// T = Tested component
var EasyTest = (function () {
    function EasyTest() {
    }
    /**
     * Wrapper for TestBed.get()
     */
    EasyTest.prototype.get = function (type) {
        return testing_1.TestBed.get(type);
    };
    /**
     * Run detect changes on the host component
     */
    EasyTest.prototype.detectChanges = function () {
        this['hostFixture'] ? this['hostFixture'].detectChanges() : this.fixture.detectChanges();
    };
    /**
     * Query a DOM element from the tested element
     * @param selector
     * @returns {any}
     */
    EasyTest.prototype.query = function (selector) {
        return this.element.querySelector(selector);
    };
    /**
     * Query a DOM elements from the tested element
     * @param selector
     * @returns {any}
     */
    EasyTest.prototype.queryAll = function (selector) {
        return this.element.querySelectorAll(selector);
    };
    /**
     *
     * @param input
     * @param inputValue
     */
    EasyTest.prototype.whenInput = function (input, inputValue) {
        if (typeof input === 'string') {
            this.component[input] = inputValue;
        }
        else {
            for (var p in input) {
                this.component[p] = input[p];
            }
        }
        this.detectChanges();
    };
    /**
     *
     * @param output
     * @param cb
     */
    EasyTest.prototype.whenOutput = function (output, cb) {
        var observable = this.component[output];
        if (typeof observable.subscribe === 'function') {
            observable.subscribe(function (result) { return cb(result); });
        }
        else {
            throw new Error(output + " in not an @Output");
        }
    };
    /**
     * Trigger event on the element via DebugElement.triggerEventHandler()
     * @param event
     * @param selector
     * @param eventObj
     */
    EasyTest.prototype.trigger = function (event, selector, eventObj) {
        if (eventObj === void 0) { eventObj = null; }
        var element = selector;
        if (typeof selector === 'string') {
            element = this.debugElement.query(platform_browser_1.By.css(selector));
        }
        if (!element) {
            console.warn("Element " + selector + " does not exists");
        }
        else {
            element.triggerEventHandler(event, eventObj);
            this.detectChanges();
        }
    };
    /**
     * Dispatch custom DOM event the old fashioned way
     * @param {HTMLElement} element
     * @param {string} eventName
     */
    EasyTest.prototype.dispatchCustomEvent = function (element, eventName) {
        element.dispatchEvent(utils_1.newEvent(eventName));
        this.detectChanges();
    };
    /** Wait a tick then detect changes */
    EasyTest.prototype.advance = function () {
        testing_1.tick();
        this.detectChanges();
    };
    return EasyTest;
}());
exports.EasyTest = EasyTest;
var EasyTestWithHost = (function (_super) {
    __extends(EasyTestWithHost, _super);
    function EasyTestWithHost() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Run detect changes on the host component
     */
    EasyTestWithHost.prototype.detectChangesHost = function () {
        this.hostFixture.detectChanges();
    };
    return EasyTestWithHost;
}(EasyTest));
exports.EasyTestWithHost = EasyTestWithHost;
/**
 * Create factory-function for tested component
 * @param component - testedType
 * @param shallow - use NO_ERRORS_SCHEMA
 * @param moduleMetadata
 */
function makeTestComponentFactory(_a) {
    var component = _a.component, _b = _a.shallow, shallow = _b === void 0 ? true : _b, moduleMetadata = __rest(_a, ["component", "shallow"]);
    beforeEach(function () {
        jasmine.addMatchers(easy_test_matchers_1.customMatchers);
    });
    beforeEach(testing_1.async(function () {
        var declarations = [component];
        if (moduleMetadata && moduleMetadata.declarations) {
            declarations.push.apply(declarations, moduleMetadata.declarations);
        }
        testing_1.TestBed.configureTestingModule(__assign({}, moduleMetadata, { schemas: [shallow ? core_1.NO_ERRORS_SCHEMA : []], declarations: declarations })).compileComponents();
    }));
    return function (componentParameters, detectChanges) {
        if (componentParameters === void 0) { componentParameters = {}; }
        if (detectChanges === void 0) { detectChanges = true; }
        var easyTest = new EasyTest();
        easyTest.fixture = testing_1.TestBed.createComponent(component);
        easyTest.debugElement = easyTest.fixture.debugElement;
        // The component instance
        easyTest.component = easyTest.debugElement.componentInstance;
        // The component native element
        easyTest.element = easyTest.debugElement.nativeElement;
        for (var p in componentParameters) {
            easyTest.component[p] = componentParameters[p];
        }
        if (detectChanges) {
            easyTest.fixture.detectChanges();
        }
        return easyTest;
    };
}
exports.makeTestComponentFactory = makeTestComponentFactory;
var HostComponent = (function () {
    function HostComponent() {
    }
    HostComponent = __decorate([
        core_1.Component({ selector: 'host-for-test', template: '' })
    ], HostComponent);
    return HostComponent;
}());
exports.HostComponent = HostComponent;
function makeHostComponentFactory(_a) {
    var tested = _a.tested, _b = _a.host, host = _b === void 0 ? HostComponent : _b, moduleMetadata = __rest(_a, ["tested", "host"]);
    beforeEach(function () {
        jasmine.addMatchers(easy_test_matchers_1.customMatchers);
    });
    beforeEach(function () {
        var declarations = [tested, host];
        if (moduleMetadata && moduleMetadata.declarations) {
            declarations.push.apply(declarations, moduleMetadata.declarations);
        }
        testing_1.TestBed.configureTestingModule(__assign({}, moduleMetadata, { declarations: declarations }));
    });
    return function (template, styles) {
        testing_1.TestBed.overrideComponent(host, { set: { template: template, styles: styles || [] } });
        var eastTest = new EasyTestWithHost();
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
 * @param mocks
 * @param moduleMetadata
 */
function createServiceFixture(_a) {
    var service = _a.service, mocks = _a.mocks, moduleMetadata = __rest(_a, ["service", "mocks"]);
    var providers = [{ provide: service, useClass: service }];
    mocks.forEach(function (type) { return providers.push(mock_1.mockProvider(type)); });
    if (moduleMetadata && moduleMetadata.providers) {
        providers.push.apply(providers, moduleMetadata.providers);
    }
    beforeEach(function () {
        testing_1.TestBed.configureTestingModule(__assign({}, moduleMetadata, { providers: providers }));
    });
    return {
        get service() {
            return testing_1.TestBed.get(service);
        }
    };
}
exports.createServiceFixture = createServiceFixture;
