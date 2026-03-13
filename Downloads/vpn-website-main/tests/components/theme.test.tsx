import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, ThemeContext } from '@/context/ThemeContext'
import ThemeSwitcher from '@/app/blog/page' // Test the extracted switcher, we can mock the hook for direct integration or test the context
import React from 'react'

// Simple test component testing ThemeContext
const TestThemeComponent = () => {
    const context = React.useContext(ThemeContext)
    return (
        <div>
            <span data-testid="theme-value">{context?.theme}</span>
            <button onClick={() => context?.toggleTheme()}>Toggle</button>
        </div>
    )
}

describe('ThemeContext & UI', () => {
    it('provides default light or dark theme and toggles correctly', () => {
        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        )

        const value = screen.getByTestId('theme-value')

        // Default might be light or dark depending on jsdom matchMedia
        const initialTheme = value.textContent
        expect(['light', 'dark']).toContain(initialTheme)

        const btn = screen.getByText('Toggle')
        fireEvent.click(btn)

        expect(value.textContent).toBe(initialTheme === 'light' ? 'dark' : 'light')
    })
})
