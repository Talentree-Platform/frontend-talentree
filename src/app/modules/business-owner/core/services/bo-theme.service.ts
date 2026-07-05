import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'bo-theme';

@Injectable({ providedIn: 'root' })
export class BoThemeService {
  private isLightSubject: BehaviorSubject<boolean>;
  readonly isLight$;

  constructor(@Inject(DOCUMENT) private document: Document) {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    this.isLightSubject = new BehaviorSubject<boolean>(savedTheme === 'light');
    this.isLight$ = this.isLightSubject.asObservable();
    this.applyTheme(this.isLightSubject.value);
  }

  get isLight(): boolean {
    return this.isLightSubject.value;
  }

  toggle(): void {
    const next = !this.isLightSubject.value;
    this.isLightSubject.next(next);
    localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark');
    this.applyTheme(next);
  }

  private applyTheme(isLight: boolean): void {
    this.document.documentElement.setAttribute('data-bo-theme', isLight ? 'light' : 'dark');
    // Chromium doesn't reliably repaint backdrop-filter compositing layers when only an
    // inherited custom property changes on a distant ancestor. Force a reflow of the whole
    // tree so every glass-morphism surface picks up the new theme immediately.
    const body = this.document.body;
    const previousDisplay = body.style.display;
    body.style.display = 'none';
    void body.offsetHeight;
    body.style.display = previousDisplay;
  }
}
