import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.forceShowAllElements();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.forceShowAllElements();
        this.initScrollReveal();
      }, 100);
    }
  }

  forceShowAllElements(): void {
    // جعل كل عناصر Fade Up تظهر
    document.querySelectorAll('.fade-up').forEach(element => {
      element.classList.add('visible');
    });
    
    // جعل كل عناصر Scroll Reveal تظهر
    document.querySelectorAll('.scroll-reveal').forEach(element => {
      element.classList.add('visible');
    });
  }

  initScrollReveal(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });

    document.querySelectorAll('.scroll-reveal:not(.visible)').forEach(element => {
      observer.observe(element);
    });
  }
}
