import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RoleSelectService } from '../../services/role-select.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnDestroy {
  @ViewChild('story', { static: true }) storyRef!: ElementRef<HTMLElement>;

  private triggers: ScrollTrigger[] = [];

  constructor(readonly roleSelect: RoleSelectService) {
    afterNextRender(() => this.init());
  }

  ngOnDestroy(): void {
    this.triggers.forEach((trigger) => trigger.kill());
  }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  private init(): void {
    const host = this.storyRef.nativeElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      host.querySelectorAll<HTMLElement>('.tt-reveal, .tt-node').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    this.initHeroIntro(host.querySelector<HTMLElement>('#home'));

    host.querySelectorAll<HTMLElement>('.tt-scene').forEach((scene) => {
      if (scene.id === 'home') return; // hero has its own dedicated on-load intro

      const items = scene.querySelectorAll('.tt-reveal');
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 32 });

      this.triggers.push(
        ScrollTrigger.create({
          trigger: scene,
          start: 'top 78%',
          onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }),
          onEnterBack: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }),
          onLeaveBack: () => gsap.to(items, { opacity: 0, y: 24, duration: 0.4, ease: 'power2.in' }),
        })
      );
    });

    host.querySelectorAll<HTMLElement>('.tt-node').forEach((node) => {
      gsap.set(node, { opacity: 0.35, scale: 0.7 });

      this.triggers.push(
        ScrollTrigger.create({
          trigger: node,
          start: 'top 85%',
          onEnter: () => gsap.to(node, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }),
          onLeaveBack: () => gsap.to(node, { opacity: 0.35, scale: 0.7, duration: 0.3 }),
        })
      );
    });
  }

  /**
   * The hero plays once, immediately on load, rather than being scroll-triggered:
   * the character slides in from the left, the copy slides in from the right,
   * and the floating questions pop in one by one after the scene settles.
   */
  private initHeroIntro(hero: HTMLElement | null): void {
    if (!hero) return;

    const character = hero.querySelector('.tt-hero-character');
    const copyItems = hero.querySelectorAll('.tt-hero-copy > *');
    const questions = hero.querySelectorAll('.tt-question');

    if (character) {
      gsap.set(character, { opacity: 0, x: -120 });
      gsap.to(character, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out', delay: 0.1 });
    }

    if (copyItems.length) {
      gsap.set(copyItems, { opacity: 0, x: 120 });
      gsap.to(copyItems, { opacity: 1, x: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.25 });
    }

    if (questions.length) {
      gsap.set(questions, { opacity: 0, scale: 0.5, y: 14 });
      gsap.to(questions, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.25,
        ease: 'back.out(1.8)',
        delay: 1,
      });
    }
  }
}
