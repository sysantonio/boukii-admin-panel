import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  currencyCode: string;
  currencySymbol: string;
}

export interface TranslationKeys {
  // Common
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.search': string;
  'common.loading': string;
  'common.yes': string;
  'common.no': string;
  'common.ok': string;
  'common.error': string;
  'common.success': string;

  // Navigation
  'nav.dashboard': string;
  'nav.seasons': string;
  'nav.courses': string;
  'nav.bookings': string;
  'nav.clients': string;
  'nav.monitors': string;
  'nav.rental': string;
  'nav.analytics': string;
  'nav.settings': string;

  // Seasons
  'seasons.title': string;
  'seasons.create': string;
  'seasons.edit': string;
  'seasons.list': string;
  'seasons.name': string;
  'seasons.start_date': string;
  'seasons.end_date': string;
  'seasons.is_active': string;
  'seasons.is_closed': string;

  // Courses
  'courses.title': string;
  'courses.create': string;
  'courses.edit': string;
  'courses.list': string;
  'courses.name': string;
  'courses.description': string;
  'courses.price': string;
  'courses.capacity': string;
  'courses.duration': string;

  // Bookings
  'bookings.title': string;
  'bookings.create': string;
  'bookings.edit': string;
  'bookings.list': string;
  'bookings.client': string;
  'bookings.course': string;
  'bookings.status': string;
  'bookings.date': string;
  'bookings.participants': string;
  'bookings.total_price': string;
  'booking.updated_successfully': string;
  'booking.created_successfully': string;

  // Analytics
  'analytics.failed_to_load_data': string;
  'analytics.dashboard_refreshed': string;
  'analytics.revenue': string;
  'analytics.retention_rate': string;
  'analytics.performance_metrics': string;
  'analytics.financial_health': string;
  'analytics.operational_health': string;
  'analytics.client_satisfaction_health': string;
  'analytics.staff_satisfaction_health': string;
  'analytics.insight_action_applied': string;

  // Clients
  'client.cannot_edit_season_closed': string;
  'client.cannot_delete_has_bookings': string;
  'client.deleted_successfully': string;

  // Monitors
  'monitor.time_slot_blocked': string;

  // Errors
  'errors.network_error': string;
  'errors.unauthorized': string;
  'errors.forbidden': string;
  'errors.validation_error': string;
  'errors.season_not_selected': string;
  'errors.season_closed': string;
  'errors.actions.retry': string;
  'errors.actions.login': string;
  'errors.actions.reload': string;
  'errors.actions.contact_support': string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  private availableLanguages: Language[] = [
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      currencyCode: 'EUR',
      currencySymbol: '€'
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false,
      dateFormat: 'MM/DD/YYYY',
      currencyCode: 'USD',
      currencySymbol: '$'
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      currencyCode: 'EUR',
      currencySymbol: '€'
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      rtl: false,
      dateFormat: 'DD.MM.YYYY',
      currencyCode: 'EUR',
      currencySymbol: '€'
    },
    {
      code: 'it',
      name: 'Italian',
      nativeName: 'Italiano',
      flag: '🇮🇹',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      currencyCode: 'EUR',
      currencySymbol: '€'
    },
    {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      flag: '🇵🇹',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      currencyCode: 'EUR',
      currencySymbol: '€'
    },
    {
      code: 'ca',
      name: 'Catalan',
      nativeName: 'Català',
      flag: '🏴󠁥󠁳󠁣󠁴󠁿',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      currencyCode: 'EUR',
      currencySymbol: '€'
    }
  ];

  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.initializeTranslation();
  }

  private initializeTranslation(): void {
    // Set available languages
    const languageCodes = this.availableLanguages.map(lang => lang.code);
    this.translate.addLangs(languageCodes);

    // Set default language
    const defaultLang = this.getStoredLanguage() || this.detectBrowserLanguage() || 'es';
    this.translate.setDefaultLang(defaultLang);

    // Set current language
    this.setLanguage(defaultLang);
  }

  setLanguage(languageCode: string): void {
    const language = this.availableLanguages.find(lang => lang.code === languageCode);
    if (!language) {
      console.warn(`Language ${languageCode} not found. Using default language.`);
      return;
    }

    this.translate.use(languageCode);
    this.currentLanguageSubject.next(language);
    this.storeLanguage(languageCode);

    // Update document language attribute
    document.documentElement.lang = languageCode;

    // Update document direction for RTL languages
    document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';

    // Dispatch language change event
    window.dispatchEvent(
      new CustomEvent('boukii-language-changed', {
        detail: { language, previousLanguage: this.currentLanguageSubject.value }
      })
    );
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  getAvailableLanguages(): Language[] {
    return [...this.availableLanguages];
  }

  translateKey(key: keyof TranslationKeys, params?: any): Observable<string> {
    return this.translate.get(key as string, params);
  }

  translateSync(key: keyof any, params?: any): string {
    return this.translate.instant(key as string, params);
  }

  // Date formatting
  formatDate(date: Date | string, format?: string): string {
    const currentLang = this.getCurrentLanguage();
    const dateFormat = format || currentLang.dateFormat;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Use Intl.DateTimeFormat for proper localization
    return new Intl.DateTimeFormat(currentLang.code, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  }

  // Currency formatting
  formatCurrency(amount: number, currencyCode?: string): string {
    const currentLang = this.getCurrentLanguage();
    const currency = currencyCode || currentLang.currencyCode;

    return new Intl.NumberFormat(currentLang.code, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Number formatting
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const currentLang = this.getCurrentLanguage();
    return new Intl.NumberFormat(currentLang.code, options).format(number);
  }

  // Relative time formatting
  formatRelativeTime(date: Date): string {
    const currentLang = this.getCurrentLanguage();
    const rtf = new Intl.RelativeTimeFormat(currentLang.code, { numeric: 'auto' });

    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        return rtf.format(diffInMinutes, 'minute');
      }
      return rtf.format(diffInHours, 'hour');
    }

    if (Math.abs(diffInDays) < 30) {
      return rtf.format(diffInDays, 'day');
    }

    const diffInMonths = Math.round(diffInDays / 30);
    return rtf.format(diffInMonths, 'month');
  }

  // Pluralization
  pluralize(count: number, key: string): string {
    return this.translate.instant(`${key}_${count === 1 ? 'singular' : 'plural'}`, { count });
  }

  // Get translation with fallback
  getTranslationWithFallback(key: string, fallback: string, params?: any): string {
    const translation = this.translate.instant(key, params);
    return translation !== key ? translation : fallback;
  }

  // Load translations dynamically
  async loadTranslations(languageCode: string): Promise<void> {
    try {
      await this.translate.reloadLang(languageCode).toPromise();
    } catch (error) {
      console.error(`Failed to load translations for ${languageCode}:`, error);
    }
  }

  // Validation helpers
  isRTL(): boolean {
    return this.getCurrentLanguage().rtl;
  }

  getLanguageDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  private getDefaultLanguage(): Language {
    return this.availableLanguages.find(lang => lang.code === 'es') || this.availableLanguages[0];
  }

  private detectBrowserLanguage(): string | null {
    const browserLang = navigator.language.split('-')[0];
    return this.availableLanguages.find(lang => lang.code === browserLang)?.code || null;
  }

  private getStoredLanguage(): string | null {
    try {
      return localStorage.getItem('boukii_language');
    } catch {
      return null;
    }
  }

  private storeLanguage(languageCode: string): void {
    try {
      localStorage.setItem('boukii_language', languageCode);
    } catch (error) {
      console.warn('Failed to store language preference:', error);
    }
  }
}
