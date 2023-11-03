import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarryAddComponent } from './quarry-add.component';

describe('QuarryAddComponent', () => {
  let component: QuarryAddComponent;
  let fixture: ComponentFixture<QuarryAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuarryAddComponent]
    });
    fixture = TestBed.createComponent(QuarryAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
