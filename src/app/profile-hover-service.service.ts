import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfileHoverService {
  isHovered = signal(false);

  setHover(state: boolean) {
    this.isHovered.set(state);
  }
}
