import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app';
import { SplashComponent } from './app/components/splash/splash';
import { AgeSelectorComponent } from './app/components/age-selector/age-selector';
import { CanvasComponent } from './app/components/canvas/canvas';
import { StoryViewerComponent } from './app/components/story/viewer/viewer';
import { StorySetupComponent } from './app/components/story-setup/story-setup';
import { AdminLogin } from './app/components/admin/admin-login/admin-login';
import { AdminPanel } from './app/components/admin/admin-panel/admin-panel';
import { StoryHistory } from './app/components/admin/story-history/story-history';
import { CatalogManager } from './app/components/admin/catalog-manager/catalog-manager';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    AgeSelectorComponent,
    CanvasComponent,
    StoryViewerComponent,
    StorySetupComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    AdminLogin,
    AdminPanel,
    StoryHistory,
    CatalogManager
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));