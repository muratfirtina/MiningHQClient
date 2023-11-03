import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarriesComponent } from './quarries.component';

describe('QuarriesComponent', () => {
  let component: QuarriesComponent;
  let fixture: ComponentFixture<QuarriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuarriesComponent]
    });
    fixture = TestBed.createComponent(QuarriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
