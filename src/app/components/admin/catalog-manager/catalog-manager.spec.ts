import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogManager } from './catalog-manager';

describe('CatalogManager', () => {
  let component: CatalogManager;
  let fixture: ComponentFixture<CatalogManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
