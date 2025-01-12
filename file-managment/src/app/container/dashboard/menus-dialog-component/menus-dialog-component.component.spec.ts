import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusDialogComponentComponent } from './menus-dialog-component.component';

describe('MenusDialogComponentComponent', () => {
  let component: MenusDialogComponentComponent;
  let fixture: ComponentFixture<MenusDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenusDialogComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
