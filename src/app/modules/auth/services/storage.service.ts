// src/app/core/services/storage.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type StorageType = 'local' | 'session';

export interface StorageConfig {
  type?: StorageType;
  prefix?: string;
  encrypt?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isBrowser: boolean;
  private readonly DEFAULT_PREFIX = 'talentree_';
  private readonly ENCRYPTION_KEY = 'talentree_encryption_key_2024'; // يجب تغييره في production

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('📦 StorageService initialized - Browser:', this.isBrowser);
  }

  // =============== 🔐 BASIC METHODS ===============

  /**
   * الحصول على قيمة من التخزين
   */
  getItem(key: string, config: StorageConfig = {}): string | null {
    if (!this.isBrowser) {
      console.warn('⚠️ StorageService: Not in browser environment');
      return null;
    }

    try {
      const storage = this.getStorage(config.type);
      const prefixedKey = this.getPrefixedKey(key, config.prefix);
      const value = storage.getItem(prefixedKey);

      if (!value) return null;

      // فك التشفير إذا كان مشفراً
      return config.encrypt ? this.decrypt(value) : value;
    } catch (error) {
      console.error(`❌ StorageService: Error getting item "${key}":`, error);
      return null;
    }
  }

  /**
   * حفظ قيمة في التخزين
   */
  setItem(key: string, value: string, config: StorageConfig = {}): boolean {
    if (!this.isBrowser) {
      console.warn('⚠️ StorageService: Not in browser environment');
      return false;
    }

    try {
      const storage = this.getStorage(config.type);
      const prefixedKey = this.getPrefixedKey(key, config.prefix);
      
      // تشفير القيمة إذا طُلب
      const finalValue = config.encrypt ? this.encrypt(value) : value;
      
      storage.setItem(prefixedKey, finalValue);
      console.log(`💾 StorageService: Saved "${key}" to ${config.type || 'local'} storage`);
      return true;
    } catch (error) {
      console.error(`❌ StorageService: Error setting item "${key}":`, error);
      return false;
    }
  }

  /**
   * حذف قيمة من التخزين
   */
  removeItem(key: string, config: StorageConfig = {}): boolean {
    if (!this.isBrowser) {
      console.warn('⚠️ StorageService: Not in browser environment');
      return false;
    }

    try {
      const storage = this.getStorage(config.type);
      const prefixedKey = this.getPrefixedKey(key, config.prefix);
      
      storage.removeItem(prefixedKey);
      console.log(`🗑️ StorageService: Removed "${key}" from ${config.type || 'local'} storage`);
      return true;
    } catch (error) {
      console.error(`❌ StorageService: Error removing item "${key}":`, error);
      return false;
    }
  }

  /**
   * مسح كل التخزين أو جزء منه
   */
  clear(prefix?: string, type: StorageType = 'local'): boolean {
    if (!this.isBrowser) {
      console.warn('⚠️ StorageService: Not in browser environment');
      return false;
    }

    try {
      const storage = this.getStorage(type);

      if (prefix) {
        // مسح المفاتيح التي تبدأ ببادئة محددة فقط
        this.clearByPrefix(prefix, storage);
      } else {
        // مسح كل شيء
        storage.clear();
      }
      
      console.log(`🧹 StorageService: Cleared ${prefix ? `"${prefix}" ` : ''}${type} storage`);
      return true;
    } catch (error) {
      console.error('❌ StorageService: Error clearing storage:', error);
      return false;
    }
  }

  // =============== 📁 JSON METHODS ===============

  /**
   * حفظ object كـ JSON
   */
  setObject<T>(key: string, value: T, config: StorageConfig = {}): boolean {
    try {
      const jsonString = JSON.stringify(value);
      return this.setItem(key, jsonString, config);
    } catch (error) {
      console.error(`❌ StorageService: Error stringifying object "${key}":`, error);
      return false;
    }
  }

  /**
   * الحصول على object من JSON
   */
  getObject<T>(key: string, config: StorageConfig = {}): T | null {
    try {
      const jsonString = this.getItem(key, config);
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      console.error(`❌ StorageService: Error parsing object "${key}":`, error);
      return null;
    }
  }

  // =============== 🔍 UTILITY METHODS ===============

  /**
   * التحقق من وجود مفتاح
   */
  hasItem(key: string, config: StorageConfig = {}): boolean {
    return this.getItem(key, config) !== null;
  }

  /**
   * الحصول على جميع المفاتيح
   */
  getAllKeys(prefix?: string, type: StorageType = 'local'): string[] {
    if (!this.isBrowser) return [];

    try {
      const storage = this.getStorage(type);
      const keys: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          // إذا كان هناك بادئة، تحقق منها
          if (!prefix || key.startsWith(prefix)) {
            // إزالة البادئة إذا كانت موجودة
            const cleanKey = this.removePrefix(key, prefix || this.DEFAULT_PREFIX);
            keys.push(cleanKey);
          }
        }
      }
      
      return keys;
    } catch (error) {
      console.error('❌ StorageService: Error getting keys:', error);
      return [];
    }
  }

  /**
   * الحصول على حجم التخزين المستخدم
   */
  getUsedSpace(type: StorageType = 'local'): number {
    if (!this.isBrowser) return 0;

    try {
      const storage = this.getStorage(type);
      let total = 0;
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          total += key.length + (value ? value.length : 0);
        }
      }
      
      return total; // بالبايت
    } catch (error) {
      console.error('❌ StorageService: Error calculating used space:', error);
      return 0;
    }
  }

  /**
   * الحصول على المساحة المتاحة
   */
  getAvailableSpace(type: StorageType = 'local'): string {
    if (!this.isBrowser) return 'Unknown';

    const used = this.getUsedSpace(type);
    const kb = Math.round(used / 1024);
    const mb = Math.round(kb / 1024);
    
    if (mb > 0) {
      return `${mb} MB`;
    } else if (kb > 0) {
      return `${kb} KB`;
    } else {
      return `${used} bytes`;
    }
  }

  // =============== 🔐 ENCRYPTION METHODS ===============

  /**
   * تشفير نص (بسيط - للاستخدام الأساسي)
   */
  private encrypt(text: string): string {
    try {
      // في production، استخدم مكتبة تشفير أقوى مثل crypto-js
      return btoa(encodeURIComponent(text));
    } catch (error) {
      console.error('❌ StorageService: Error encrypting text:', error);
      return text;
    }
  }

  /**
   * فك تشفير نص
   */
  private decrypt(encryptedText: string): string {
    try {
      return decodeURIComponent(atob(encryptedText));
    } catch (error) {
      console.error('❌ StorageService: Error decrypting text:', error);
      return encryptedText;
    }
  }

  // =============== 🛠️ PRIVATE HELPERS ===============

  private getStorage(type: StorageType = 'local'): Storage {
    return type === 'session' ? sessionStorage : localStorage;
  }

  private getPrefixedKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || this.DEFAULT_PREFIX;
    return `${finalPrefix}${key}`;
  }

  private removePrefix(key: string, prefix: string): string {
    return key.startsWith(prefix) ? key.slice(prefix.length) : key;
  }

  private clearByPrefix(prefix: string, storage: Storage): void {
    const keysToRemove: string[] = [];
    
    // جمع المفاتيح التي تبدأ بالبادئة
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // حذف المفاتيح المجمعة
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  // =============== 🎯 AUTH SPECIFIC METHODS ===============

  /**
   * حفظ بيانات المستخدم (مخصص للـ Auth)
   */
  saveAuthData(token: string, refreshToken: string, user: any, expiresIn?: number): void {
    // حفظ الـ tokens
    this.setItem('token', token, { prefix: 'auth_' });
    this.setItem('refreshToken', refreshToken, { prefix: 'auth_' });
    
    // حفظ بيانات المستخدم
    this.setObject('user', user, { prefix: 'auth_' });
    
    // حفظ وقت الانتهاء إذا وجد
    if (expiresIn) {
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
      this.setItem('tokenExpiry', expiryDate.toISOString(), { prefix: 'auth_' });
    }
    
    console.log('🔐 Auth data saved to storage');
  }

  /**
   * مسح بيانات المصادقة
   */
  clearAuthData(): void {
    this.clear('auth_');
    console.log('🔐 Auth data cleared from storage');
  }

  /**
   * الحصول على بيانات المصادقة
   */
  getAuthData(): {
    token: string | null;
    refreshToken: string | null;
    user: any | null;
    tokenExpiry: Date | null;
  } {
    return {
      token: this.getItem('token', { prefix: 'auth_' }),
      refreshToken: this.getItem('refreshToken', { prefix: 'auth_' }),
      user: this.getObject('user', { prefix: 'auth_' }),
      tokenExpiry: this.getItem('tokenExpiry', { prefix: 'auth_' })
        ? new Date(this.getItem('tokenExpiry', { prefix: 'auth_' })!)
        : null
    };
  }

  /**
   * التحقق من وجود بيانات مصادقة
   */
  hasAuthData(): boolean {
    const authData = this.getAuthData();
    return !!(authData.token && authData.user);
  }

  /**
   * التحقق من صلاحية الـ token
   */
  isTokenValid(): boolean {
    const expiryStr = this.getItem('tokenExpiry', { prefix: 'auth_' });
    if (!expiryStr) return false;

    const expiryDate = new Date(expiryStr);
    return new Date() < expiryDate;
  }

  /**
   * التحقق إذا كان الـ token سينتهي قريباً
   */
  isTokenExpiringSoon(minutes: number = 5): boolean {
    const expiryStr = this.getItem('tokenExpiry', { prefix: 'auth_' });
    if (!expiryStr) return false;

    const expiryDate = new Date(expiryStr);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes < minutes && diffMinutes > 0;
  }
}