import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeSelectorComponent } from './age-selector';

describe('AgeSelector', () => {
  let component: AgeSelectorComponent;
  let fixture: ComponentFixture<AgeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgeSelectorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
