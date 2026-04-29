import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  currentSlide = 0;
  slides = [0, 1, 2, 3, 4];
  private intervalId: any;

  // فيديوهات مختلفة لكل شريحة
  videos = [
    '../../../../../assets/videos/fashion.mp4',  // Fashion
    '../../../../../assets/videos/bags.mp4',  // Bags
    '../../../../../assets/videos/beauty.mp4',  // Beauty
    '../../../../../assets/videos/jewlery.mp4',  // Jewelry
    '../../../../../assets/videos/handmade.mp4'   //handmade
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.changeVideo();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.changeVideo();
  }

  goToSlide(index: number): void {
    if (this.currentSlide !== index) {
      this.currentSlide = index;
      this.changeVideo();
      this.resetAutoSlide();
    }
  }

  changeVideo(): void {
    if (this.heroVideo && this.heroVideo.nativeElement) {
      const video = this.heroVideo.nativeElement;
      const videoSource = this.videos[this.currentSlide];
      
      // تغيير مصدر الفيديو
      video.src = videoSource;
      video.volume = 0;
      video.muted = true;
      video.load();
      
      // تشغيل الفيديو
      video.play().catch(err => {
        console.log('Video play error:', err);
      });
      
      console.log('Video changed to slide:', this.currentSlide, videoSource);
    }
  }

  resetAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.startAutoSlide();
  }
}
