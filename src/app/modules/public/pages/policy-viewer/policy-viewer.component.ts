// src/app/modules/public/pages/policy-viewer/policy-viewer.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AdminPlatformService, PolicyDto } from '../../../../modules/admin/core/services/admin-platform.service';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

@Component({
  selector: 'app-policy-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicFooterComponent],
  templateUrl: './policy-viewer.component.html',
  styleUrls: ['./policy-viewer.component.css']
})
export class PolicyViewerComponent implements OnInit, OnDestroy {
  policyType = '';
  policyTitle = '';
  policyData: PolicyDto | null = null;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  // Predefined local fallbacks to ensure guest access works even if backend requires JWT for /api/admin
  private fallbackPolicies: Record<string, PolicyDto> = {
    PrivacyPolicy: {
      id: 0,
      type: 'PrivacyPolicy',
      title: 'Privacy Policy',
      content: `Welcome to Talentree's Privacy Policy. Your privacy is critically important to us.\n\n` +
        `1. Information We Collect\n` +
        `We collect information you provide directly to us when creating an account, posting products, making purchases, or communicating with us. This includes your name, email address, password, billing information, and phone number.\n\n` +
        `2. How We Use Your Information\n` +
        `We use the collected information to operate, maintain, and improve our digital marketplace. This includes processing transactions, providing customer service, sending support and administrative messages, and managing platform security.\n\n` +
        `3. Information Sharing and Disclosure\n` +
        `We do not share your personal information with third parties except as described in this policy. Transactions are processed securely via integrated payment gateways (like Stripe), and relevant delivery information is shared with sellers/suppliers to facilitate shipping.\n\n` +
        `4. Security and Data Integrity\n` +
        `Talentree employs industry-standard encryption and security measures to protect your credentials and data. However, no internet transmission is 100% secure, and we encourage you to protect your login information and configure 2FA for maximum account safety.`,
      version: '1.0 (Local)',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    TermsOfService: {
      id: 0,
      type: 'TermsOfService',
      title: 'Terms of Service',
      content: `Welcome to Talentree's Terms of Service.\n\n` +
        `1. Acceptance of Terms\n` +
        `By accessing or using the Talentree digital marketplace web platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the platform.\n\n` +
        `2. User Accounts and Eligibility\n` +
        `To use certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information and maintain the security of your password. Accounts found using fake or fraudulent credentials will be suspended immediately.\n\n` +
        `3. Seller and Buyer Transactions\n` +
        `Talentree acts as a digital marketplace enabling transactions between Buyers, Business Owners, and Suppliers. Sellers are responsible for listing accuracy, fulfillment of orders, and resolving disputes. Buyers agree to pay all listed fees, taxes, and shipping rates upon checkout.\n\n` +
        `4. Prohibited Conduct\n` +
        `Users are prohibited from interfering with platform operations, uploading malicious code, engaging in fraudulent transactions, or bypassing security controls. System-detected anomalies may trigger automatic account blocks pending administrative review.`,
      version: '1.0 (Local)',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    RefundPolicy: {
      id: 0,
      type: 'RefundPolicy',
      title: 'Refund Policy',
      content: `Welcome to Talentree's Refund Policy.\n\n` +
        `1. Standard Marketplace Returns\n` +
        `Buyers may request a refund for eligible products within 14 days of receipt. Products must be unused, in their original packaging, and in the same condition that you received them.\n\n` +
        `2. Raw Materials and Production Requests\n` +
        `Refunds on custom production requests or raw materials orders are subject to review by the supplier. Once a production request has entered the manufacturing phase, deposits or quotes may become non-refundable.\n\n` +
        `3. Refund Request Process\n` +
        `To initiate a refund, log in to your Customer dashboard, navigate to Orders, select the specific product item, and submit a refund request with valid evidence. The business owner will review and respond to the request within 3-5 business days.\n\n` +
        `4. Processing and Disputes\n` +
        `Approved refunds will be processed, and a credit will automatically be applied to your original method of payment via our payment gateway within 5-10 business days. For unresolved disputes, users can elevate their claim to our administrative support desk.`,
      version: '1.0 (Local)',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ShippingPolicy: {
      id: 0,
      type: 'ShippingPolicy',
      title: 'Shipping Policy',
      content: `Welcome to Talentree's Shipping Policy.\n\n` +
        `1. Standard Delivery Timelines\n` +
        `Sellers and suppliers strive to fulfill and dispatch orders promptly. Estimated delivery ranges are calculated automatically during checkout based on the standard and express shipping settings defined by the platform administrator.\n\n` +
        `2. Free Shipping Thresholds\n` +
        `Sellers may offer free shipping to customers once the cart subtotal exceeds the threshold defined for the shop category. Standard shipping rates apply to all orders below this limit.\n\n` +
        `3. Shipping Rates and Handling\n` +
        `Shipping rates are calculated dynamically at checkout. All duties, custom clearance rates, and destination handling fees are the responsibility of the customer.\n\n` +
        `4. Tracking and Support\n` +
        `Once an order is shipped, tracking updates will be logged under your Order details history. For any shipment delays or lost packages, please contact the seller directly or file a support ticket in the Support center.`,
      version: '1.0 (Local)',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  constructor(
    private route: ActivatedRoute,
    private platformService: AdminPlatformService
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.policyType = data['policyType'] || 'TermsOfService';
      this.setPolicyTitle(this.policyType);
      this.loadPolicy();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setPolicyTitle(type: string): void {
    switch (type) {
      case 'PrivacyPolicy':
        this.policyTitle = 'Privacy Policy';
        break;
      case 'TermsOfService':
        this.policyTitle = 'Terms of Service';
        break;
      case 'RefundPolicy':
        this.policyTitle = 'Refund Policy';
        break;
      case 'ShippingPolicy':
        this.policyTitle = 'Shipping Policy';
        break;
      default:
        this.policyTitle = 'Platform Policy';
    }
  }

  loadPolicy(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.policyData = null;

    this.platformService.getPolicy(this.policyType)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.content) {
            this.policyData = response.data;
          } else {
            // If empty/null response, fallback to local policy
            this.policyData = this.fallbackPolicies[this.policyType] || null;
          }
        },
        error: (err) => {
          console.warn('Error fetching policy from backend, loading fallback content:', err);
          // Fallback to local copy on 401 Unauthorized, 403 Forbidden, 404, or 500
          this.policyData = this.fallbackPolicies[this.policyType] || null;
          if (!this.policyData) {
            this.errorMessage = 'Could not load platform policy. Please check your connection and try again.';
          }
        }
      });
  }
}
