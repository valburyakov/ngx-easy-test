[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)

# ngx-easy-test
ngx-easy-test provides two extensions for Angular 4 Testing Framework:

- a cleaner API for testing
- a set of custom matchers

## Note
Currently, it only supports Angular 4+ and Jasmine. 

## Introduction
Writing tests for our code is part of our daily routine. When working on large applications with many components, it can take time and effort.
Although Angular provides us with great tools to deal with these things, it still requires quite a lot of boilerplate work.
For this reason, I decided to create a library that will make it easier for us to write tests by cutting the boilerplate and add custom Jasmine matchers. 

## Installation
Using npm by running ```npm install @valburyakov/ngx-easy-test --save-dev```

Using yarn by running ```yarn add @valburyakov/ngx-easy-test --dev```


## Example
```ts
// zippy.component.ts

@Component({
  selector: 'zippy',
  template: `
    <div class="zippy">
      <div (click)="toggle()" class="zippy__title">
        <span class="arrow">{{ visible ? 'Close' : 'Open' }}</span> {{title}}
      </div>
      <div *ngIf="visible" class="zippy__content">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ZippyComponent {

  @Input() title;
  visible = false;

  toggle() {
    this.visible = !this.visible;
  }
}
```
```ts
// zippy.component.spec.ts

import { makeHostComponentFactory, EasyTestWithHost } from 'ngx-easy-test';

describe('ZippyComponent', () => {
  let host: EasyTestWithHost<ZippyComponent>;
  
  const createHost = makeHostComponentFactory({tested: ZippyComponent});

  it('should display the title', () => {
    host = createHost(`<zippy title="Zippy title"></zippy>`);
    
    expect(host.query('.zippy__title')).toContainText('Zippy title');
  });

  it('should display the content', () => {
    host = createHost(`<zippy title="Zippy title">Zippy content</zippy>`);
    
    host.trigger('click', '.zippy__title');
    
    expect(host.query('.zippy__content')).toContainText('Zippy content');
  });

  it('should display the "Open" word if closed', () => {
    host = createHost(`<zippy title="Zippy title">Zippy content</zippy>`);
    
    expect(host.query('.arrow')).toContainText('Open');
    expect(host.query('.arrow')).not.toContainText('Close');
  });

  it('should display the "Close" word if open', () {
    host = createHost(`<zippy title="Zippy title">Zippy content</zippy>`);
    
    host.trigger('click', '.zippy__title');
    
    expect(host.query('.arrow')).toContainText('Close');
    expect(host.query('.arrow')).not.toContainText('Open');
  });

  it('should be closed by default', () => {
    host = createHost(`<zippy title="Zippy title"></zippy>`);
    
    expect('.zippy__content').not.toBeInDOM();
  });

  it('should toggle the content', () => {
    host = createHost(`<zippy title="Zippy title"></zippy>`);
    
    host.trigger('click', '.zippy__title');
    expect('.zippy__content').toBeInDOM();
    
    host.trigger('click', '.zippy__title');
    expect('.zippy__content').not.toBeInDOM();
  });

});
```

## Without Host
```ts
// button.component.ts

@Component({
  selector: 'app-button',
  template: `
    <button class="{{className}}" (click)="onClick($event)">{{title}}</button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() className = 'success';
  @Input() title = '';
  @Output() click = new EventEmitter();

  onClick( $event ) {
    this.click.emit($event);
  }
}
```

```ts
// button.component.spec.ts

import { ButtonComponent } from './button.component';
import { EasyTest, makeTestComponentFactory } from 'ngx-easy-test';

describe('ButtonComponent', () => {

  let easyTest: EasyTest<ButtonComponent>;

  const createComponent = makeTestComponentFactory({component: ButtonComponent});

  it('should set the "success" class by default', () => {
    easyTest = createComponent();
    expect(easyTest.query('button')).toHaveClass('success');
  });

  it('should set the class name according to the [className]', () => {
    easyTest = createComponent({ className: 'danger' });
    
    expect(easyTest.query('button')).toHaveClass('danger');
    expect(easyTest.query('button')).not.toHaveClass('success');
  });

  it('should set the title according to the [title]', () => {
    easyTest = createComponent({'title': 'Click'});
    
    expect(easyTest.query('button')).toContainText('Click');
  });

  it('should emit the $event on click', function () => {
    let output;
    easyTest = createComponent();
    easyTest.whenOutput<{ type: string }>('click', result => output = result);
    
    easyTest.trigger('click', 'button', { type: 'click' });
    
    expect(output).toEqual({ type: 'click' });
  });

});
```

## With Custom Host Component
```ts
@Component({ selector: 'custom-host', template: '' })
class CustomHostComponent {
  title = 'Custom HostComponent';
}
describe('With Custom Host Component', function () {
  let host: EasyTestWithHost<AlertComponent, CustomHostComponent>;

  const createHost = makeHostComponentFactory({tested: AlertComponent, host: CustomHostComponent});

  it('should display the host component title', () => {
    const host = createHost(`<app-alert [title]="title"></app-alert>`);
    
    expect(host.query('.alert')).toContainText('Custom HostComponent');
  });
});
```

## Testing Directives
```ts
@Directive({
  selector: '[highlight]'
})
export class HighlightDirective {

  @HostBinding('style.background-color') backgroundColor : string;

  @HostListener('mouseover')
  onHover() {
    this.backgroundColor = '#000000';
  }

  @HostListener('mouseout')
  onLeave() {
    this.backgroundColor = '#ffffff';
  }
}
```

```ts
import { makeHostComponentFactory, EasyTestWithHost } from './easy-test';
import { HighlightDirective } from './highlight.directive';

describe('HighlightDirective', function () {
  let host: EasyTestWithHost<HighlightDirective>;

  const createHost = makeHostComponentFactory<HighlightDirective>(HighlightDirective);

  it('should change the background color', () => {
    host = createHost(`<div highlight>Testing HighlightDirective</div>`);
    
    host.trigger('mouseover', host.testedDe);

    expect(host.element).toHaveStyle({
      backgroundColor: '#000000'
    });

    host.trigger('mouseout', host.testedDe);

    expect(host.element).toHaveStyle({
      backgroundColor: '#ffffff'
    });
  });

});
```

## Testing Services
```ts
import { CounterService } from './counter.service';
import { EasyTestService, createServiceFixture } from './ngx-easy-test';

describe('CounterService Without Mock', () => {
  const easyTest = createServiceFixture({service: CounterService});

  it('should be 0', () => {
    expect(easyTest.service.counter).toEqual(0);
  });
});
```

## Testing Services With Mocks
```ts
import { CounterService } from './counter.service';
import { EasyTestService, createServiceFixture } from './ngx-easy-test';

describe('CounterService Without Mock', () => {
  const easyTest = createServiceFixture({service: CounterService, mocks: [OtherService]});

  it('should be 0', () => {
    expect(easyTest.service.counter).toEqual(0);
  });
});
```

## Typed Mocks
```ts
import { SpyObject, mockProvider } from './ngx-easy-test';

 let otherService: SpyObject<OtherService>;
 let service: TestedService;
 
 beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestedService,
        mockProvider(OtherService)
      ],
    });

    otherService = TestBed.get(OtherService);
    service = TestBed.get(GoogleBooksService);
  });
  
  it('should be 0', () => {
    otherService.method.andReturn('mocked value'); // mock is strongly typed
  
   // then test serivce 
  });

```

## API
 - `makeTestComponentFactory<T>({ component : Type<T>, shallow?: booleant, ...moduleMetadata? : TestModuleMetadata } )`
 - `makeHostComponentFactory<T, H>({ tested : Type<T>, host?: Type<H>, moduleMetadata? : TestModuleMetadata } )`
 - `createServiceFixture<S>({ service : Type<S>, mocks: Type[], ...moduleMetadata? : TestModuleMetadata })`
 - `mockProvider<T>(type: Type<T>): Provider`
 
## Methods
- `detectChanges()`
  - Run detect changes on the tested element/host
- `query(selector: string)`
  - Query a DOM element from the tested element
- `queryAll(selector: string)`
  - Query a DOM elements from the tested element
- `whenInput(input : object | string, inputValue? : any)`
  - Change an @Input() of the tested component
- `whenOutput<T>( output : string, cb : ( result : T ) => any )`
  - Listen for an @Output() of the tested component and get the result
- `trigger<T>( event : string, selector : string, eventObj = null  )`
  - Trigger an event on the selector element
- `dispatchCustomEvent(input: HTMLElement, eventName: string)`
  - Dispatch custom event on element and detect changes
- `advance()`
  - Wait a tick then detect changes

## Matchers
- `toBeChecked()`
  - Only for tags that have checked attribute
  - e.g. `expect(this.query('input[type="checkbox"]')).toBeChecked();`
- `toBeDisabled()`
  - e.g. `expect(this.query('.radio')).toBeDisabled();`
- `toBeInDOM()`
  - Checks to see if the matched element is attached to the DOM
  - e.g. `expect(this.query('.ngIf')).toBeInDOM()`
- `toHaveAttr({attr, val})`
    - e.g. `expect(this.testedElement).toHaveAttr({
                                          attr: 'role',
                                          val: 'newRole'
    });`
- `toHaveClass(className)`
  - e.g. `expect(this.query('.alert')).toHaveClass('danger');`
- `toHaveStyle(style)`
  - e.g. `expect(this.query('.alert')).toHaveStyle({ height: '200px' });`
  - **Note: Colors only works with rgb(a) and hex (six numbers) values**
- `toContainText(text)`
  - e.g. `expect(this.query('.alert')).toContainText('Text');`
- `toHaveValue(value)`
  - only for elements on which `val` can be called (`input`, `textarea`, etc)
  - e.g. `expect(this.query('.input')).toHaveValue('Value!!');`
