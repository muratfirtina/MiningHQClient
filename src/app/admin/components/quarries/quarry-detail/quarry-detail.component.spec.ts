import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarryDetailComponent } from './quarry-detail.component';

describe('QuarryDetailComponent', () => {
  let component: QuarryDetailComponent;
  let fixture: ComponentFixture<QuarryDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuarryDetailComponent]
    });
    fixture = TestBed.createComponent(QuarryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
