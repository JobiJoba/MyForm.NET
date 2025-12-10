import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadAuthState();
  }

  login(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }

  private loadAuthState(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.logout();
      }
    }
  }
}
