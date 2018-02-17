"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createSpyObject(type) {
    const mock = {};
    function createGuinnessCompatibleSpy(name) {
        const newSpy = jasmine.createSpy(name);
        newSpy.andCallFake = newSpy.and.callFake;
        newSpy.andReturn = newSpy.and.returnValue;
        newSpy.reset = newSpy.calls.reset;
        // revisit return null here (previously needed for rtts_assert).
        newSpy.and.returnValue(null);
        return newSpy;
    }
    function installProtoMethods(proto) {
        if (proto === null || proto === Object.prototype) {
            return;
        }
        for (const key of Object.getOwnPropertyNames(proto)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            if (typeof descriptor.value === 'function' && key !== 'constructor') {
                mock[key] = createGuinnessCompatibleSpy(key);
            }
        }
        installProtoMethods(Object.getPrototypeOf(proto));
    }
    installProtoMethods(type.prototype);
    return mock;
}
exports.createSpyObject = createSpyObject;
function mockProvider(type) {
    return {
        provide: type,
        useFactory: () => createSpyObject(type),
    };
}
exports.mockProvider = mockProvider;
