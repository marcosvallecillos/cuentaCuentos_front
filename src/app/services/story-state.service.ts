import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum AppState {
  SPLASH = 'splash',
  AGE_SELECT = 'age-select',
  STORY_SETUP = 'story-setup',
  STORY_VIEWING = 'story-viewing',
  STORY_COMPLETE = 'story-complete'
}

@Injectable({
  providedIn: 'root'
})
export class StoryStateService {
  private currentStateSubject = new BehaviorSubject<AppState>(AppState.SPLASH);
  private userAgeSubject = new BehaviorSubject<number | null>(null);
  private characterSubject = new BehaviorSubject<string>('');
  private placeSubject = new BehaviorSubject<string>('');
  private emotionSubject = new BehaviorSubject<string>('');
  private fullStorySubject = new BehaviorSubject<string>('');
  private interactionCountSubject = new BehaviorSubject<number>(0);
  private isMutedSubject = new BehaviorSubject<boolean>(false);
  private currentStoryIdSubject = new BehaviorSubject<number | null>(null);

  currentState$ = this.currentStateSubject.asObservable();
  userAge$ = this.userAgeSubject.asObservable();
  character$ = this.characterSubject.asObservable();
  place$ = this.placeSubject.asObservable();
  emotion$ = this.emotionSubject.asObservable();
  fullStory$ = this.fullStorySubject.asObservable();
  interactionCount$ = this.interactionCountSubject.asObservable();
  isMuted$ = this.isMutedSubject.asObservable();
  currentStoryId$ = this.currentStoryIdSubject.asObservable();

  setState(state: AppState) {
    this.currentStateSubject.next(state);
  }

  setUserAge(age: number) {
    this.userAgeSubject.next(age);
  }

  setSetupData(character: string, place: string, emotion: string) {
    this.characterSubject.next(character);
    this.placeSubject.next(place);
    this.emotionSubject.next(emotion);
  }

  appendToStory(text: string) {
    const current = this.fullStorySubject.value;
    this.fullStorySubject.next(current + '\n\n' + text);
  }

  resetStory() {
    this.fullStorySubject.next('');
  }

  incrementInteraction() {
    this.interactionCountSubject.next(this.interactionCountSubject.value + 1);
  }

  getInteractionCount(): number {
    return this.interactionCountSubject.value;
  }

  setStoryId(id: number) {
    this.currentStoryIdSubject.next(id);
  }

  getStoryId(): number | null {
    return this.currentStoryIdSubject.value;
  }

  getSetupData() {
    return {
      character: this.characterSubject.value,
      place: this.placeSubject.value,
      emotion: this.emotionSubject.value
    };
  }

  getUserAge(): number | null {
    return this.userAgeSubject.value;
  }

  reset() {
    this.currentStateSubject.next(AppState.SPLASH);
    this.userAgeSubject.next(null);
    this.characterSubject.next('');
    this.placeSubject.next('');
    this.emotionSubject.next('');
    this.fullStorySubject.next('');
    this.interactionCountSubject.next(0);
    this.currentStoryIdSubject.next(null);
  }

  toggleMute() {
    this.isMutedSubject.next(!this.isMutedSubject.value);
  }

  getIsMuted(): boolean {
    return this.isMutedSubject.value;
  }
}