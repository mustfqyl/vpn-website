import '@testing-library/dom'
import { TextEncoder, TextDecoder } from 'util'
if (typeof global.TextEncoder === 'undefined') {
    (global as any).TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
    (global as any).TextDecoder = TextDecoder
}

process.env.JWT_SECRET = 'test-secret';
process.env.AUTH_SECRET = 'test-auth-secret';
import { vi } from 'vitest'

// Mock browser APIs if window is defined
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    }
}
