import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionAddComponent } from './production-add.component';

describe('ProductionAddComponent', () => {
  let component: ProductionAddComponent;
  let fixture: ComponentFixture<ProductionAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductionAddComponent]
    });
    fixture = TestBed.createComponent(ProductionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
