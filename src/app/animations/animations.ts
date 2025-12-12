import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

// Animación de fade in/out
export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

// Animación de slide down
export const slideDown = trigger('slideDown', [
  transition(':enter', [
    style({ transform: 'translateY(-20px)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
  ])
]);

// Animación de slide up
export const slideUp = trigger('slideUp', [
  transition(':enter', [
    style({ transform: 'translateY(20px)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
  ])
]);

// Animación de slide in desde la derecha
export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

// Animación de fade in con escala
export const fadeInScale = trigger('fadeInScale', [
  transition(':enter', [
    style({ transform: 'scale(0.9)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
  ])
]);

// Animación de bounce
export const bounce = trigger('bounce', [
  transition(':enter', [
    animate('600ms ease-in-out', keyframes([
      style({ transform: 'translateY(-30px)', opacity: 0, offset: 0 }),
      style({ transform: 'translateY(0)', opacity: 1, offset: 0.5 }),
      style({ transform: 'translateY(-10px)', offset: 0.75 }),
      style({ transform: 'translateY(0)', offset: 1 })
    ]))
  ])
]);

// Animación de shake (para errores)
export const shake = trigger('shake', [
  transition('* => shake', [
    animate('400ms', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.25 }),
      style({ transform: 'translateX(10px)', offset: 0.5 }),
      style({ transform: 'translateX(-10px)', offset: 0.75 }),
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

// Animación de rotación
export const rotate = trigger('rotate', [
  state('default', style({ transform: 'rotate(0)' })),
  state('rotated', style({ transform: 'rotate(180deg)' })),
  transition('default <=> rotated', animate('300ms ease-in-out'))
]);

// Animación de lista (para items que aparecen uno por uno)
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    animate('300ms', keyframes([
      style({ opacity: 0, transform: 'translateX(-100px)', offset: 0 }),
      style({ opacity: 0.5, transform: 'translateX(10px)', offset: 0.7 }),
      style({ opacity: 1, transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);