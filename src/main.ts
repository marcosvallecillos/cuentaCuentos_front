import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app';
import { SplashComponent } from './app/components/splash/splash';
import { AgeSelectorComponent } from './app/components/age-selector/age-selector';
import { CanvasComponent } from './app/components/canvas/canvas';
import { StoryViewerComponent } from './app/components/story/viewer/viewer';
import { StorySetupComponent } from './app/components/story-setup/story-setup';

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
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));