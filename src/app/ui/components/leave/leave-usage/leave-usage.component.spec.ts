import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveUsageComponent } from './leave-usage.component';

describe('LeaveUsageComponent', () => {
  let component: LeaveUsageComponent;
  let fixture: ComponentFixture<LeaveUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaveUsageComponent]
    });
    fixture = TestBed.createComponent(LeaveUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
