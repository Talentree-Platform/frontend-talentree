import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/modules/auth/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  providers: [
     provideRouter(routes),
     provideHttpClient(withInterceptors([authInterceptor])),
     provideAnimations(), // replaces BrowserAnimationsModule
    provideToastr({        // replaces ToastrModule.forRoot()
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true
    })
  ]
}).catch(err => console.error(err));
