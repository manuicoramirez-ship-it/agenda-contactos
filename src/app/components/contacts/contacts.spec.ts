import { TestBed } from '@angular/core/testing';
import { Contacts } from './contacts';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from '../../../environments/environment';

describe('Contacts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contacts],
      providers: [
        provideRouter(routes),
        provideAnimations(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore())
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Contacts);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});