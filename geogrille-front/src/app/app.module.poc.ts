/**
 * If your generated Angular project uses NgModules (app.module.ts),
 * copy/paste the content below into src/app/app.module.ts.
 *
 * If your project is standalone-based (app.config.ts),
 * add the JwtInterceptor as an HTTP_INTERCEPTORS provider there and ensure FormsModule is imported.
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { JwtInterceptor } from './services/jwt.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
