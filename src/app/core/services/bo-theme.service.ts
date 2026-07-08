import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'bo-theme';

@Injectable({ providedIn: 'root' })
export class BoThemeService {
  private isLightSubject: BehaviorSubject<boolean>;
  readonly isLight$;
  private readonly isBrowser: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    const savedTheme = this.isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
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
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark');
    }
    this.applyTheme(next);
  }

  private applyTheme(isLight: boolean): void {
    this.document.documentElement.setAttribute('data-bo-theme', isLight ? 'light' : 'dark');

    if (!this.isBrowser) {
      return;
    }

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
