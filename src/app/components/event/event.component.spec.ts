import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EventComponent } from './event.component';
import { By } from '@angular/platform-browser';

describe('EventComponent', () => {
  let component: EventComponent;
  let fixture: ComponentFixture<EventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the title of the page', () => {
    const de = fixture.debugElement.query(By.css('.title'));
    expect(de.nativeElement.textContent).toContain('ALL EVENTS ARE CANCELLED !');
      });

  it('should show the alert button', () => {
    const de = fixture.debugElement.query(By.css('.alert'));
    expect(de.nativeElement.textContent).toContain('COVID-19 alert!');
      });

  it('should show information of the page', () => {
    const de = fixture.debugElement.query(By.css('.info1'));
    expect(de.nativeElement.textContent).toContain('Please note that any access to the University');
      });
  it('should show information of the page', () => {
        const de = fixture.debugElement.query(By.css('.info2'));
        expect(de.nativeElement.textContent).toContain('Until further notice');
          });
  it('should show information of the page', () => {
            const de = fixture.debugElement.query(By.css('.info3'));
            expect(de.nativeElement.textContent).toContain('For more assistance');
              });
  it('should show information of the page', () => {
                const de = fixture.debugElement.query(By.css('.info4'));
                expect(de.nativeElement.textContent).toContain('Concordia');
                  });

  it('should have a clickable button to concordias COVID19 website', async(() => {
      const button = fixture.debugElement.nativeElement.querySelector('link');
      button.click();
      fixture.whenStable().then(() => {
        expect(location.href).toBe('http://www.concordia.ca/covid19info.html?utm_source=vanity&utm_campaign=covid19');
       });
      }));


});
