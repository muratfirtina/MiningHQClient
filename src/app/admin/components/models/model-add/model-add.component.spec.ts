import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelAddComponent } from './model-add.component';

describe('ModelAddComponent', () => {
  let component: ModelAddComponent;
  let fixture: ComponentFixture<ModelAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModelAddComponent]
    });
    fixture = TestBed.createComponent(ModelAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
