import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryHistory } from './story-history';

describe('StoryHistory', () => {
  let component: StoryHistory;
  let fixture: ComponentFixture<StoryHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
