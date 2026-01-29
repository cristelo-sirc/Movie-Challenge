/**
 * Theme Manager - Dynamic Decade-Based Theming
 * Changes the visual style based on the current movie's decade
 */

const ThemeManager = (function () {
    'use strict';

    let currentTheme = null;
    let currentDecade = null;

    // Theme definitions for each decade
    const themes = {
        '1980s': {
            name: '1980s',
            displayName: "80's Neon",
            colors: {
                primary: '#ff00ff',      // Neon Magenta
                secondary: '#00ffff',    // Cyan
                accent: '#ffff00',       // Yellow
                background: '#1a0a2e',   // Dark Purple
                surface: '#2d1b4e',
                cardGlow: 'rgba(255, 0, 255, 0.4)'
            },
            font: "'Press Start 2P', monospace",
            pattern: 'grid'
        },
        '1990s': {
            name: '1990s',
            displayName: "90's Grunge",
            colors: {
                primary: '#8b0000',      // Dark Red
                secondary: '#2f4f4f',    // Dark Slate
                accent: '#daa520',       // Goldenrod
                background: '#1a1a1a',   // Near Black
                surface: '#2a2a2a',
                cardGlow: 'rgba(139, 0, 0, 0.4)'
            },
            font: "'Rock Salt', cursive",
            pattern: 'grunge'
        },
        '2000s': {
            name: '2000s',
            displayName: "Y2K Future",
            colors: {
                primary: '#00ff41',      // Matrix Green
                secondary: '#0080ff',    // Electric Blue
                accent: '#c0c0c0',       // Silver
                background: '#0a0a0f',   // Deep Black
                surface: '#1a1a2e',
                cardGlow: 'rgba(0, 255, 65, 0.3)'
            },
            font: "'Orbitron', sans-serif",
            pattern: 'matrix'
        },
        '2010s': {
            name: '2010s',
            displayName: "Modern",
            colors: {
                primary: '#1db954',      // Spotify Green
                secondary: '#5865f2',    // Discord Blurple
                accent: '#ffffff',       // White
                background: '#0a0a0a',   // True Black
                surface: '#1a1a1a',
                cardGlow: 'rgba(29, 185, 84, 0.3)'
            },
            font: "'Inter', sans-serif",
            pattern: 'minimal'
        },
        '2020s': {
            name: '2020s',
            displayName: "Neo Modern",
            colors: {
                primary: '#a855f7',      // Purple
                secondary: '#ec4899',    // Pink
                accent: '#06b6d4',       // Cyan
                background: '#09090b',   // Zinc-950
                surface: '#18181b',      // Zinc-900
                cardGlow: 'rgba(168, 85, 247, 0.3)'
            },
            font: "'Inter', sans-serif",
            pattern: 'gradient'
        }
    };

    /**
     * Get theme for a given year
     */
    function getThemeForYear(year) {
        if (year >= 2020) return themes['2020s'];
        if (year >= 2010) return themes['2010s'];
        if (year >= 2000) return themes['2000s'];
        if (year >= 1990) return themes['1990s'];
        return themes['1980s'];
    }

    /**
     * Get decade string for a year
     */
    function getDecadeForYear(year) {
        if (year >= 2020) return '2020s';
        if (year >= 2010) return '2010s';
        if (year >= 2000) return '2000s';
        if (year >= 1990) return '1990s';
        return '1980s';
    }

    /**
     * Apply theme CSS variables to document
     */
    function applyTheme(theme) {
        const root = document.documentElement;
        const body = document.body;

        // Set CSS custom properties
        root.style.setProperty('--theme-primary', theme.colors.primary);
        root.style.setProperty('--theme-secondary', theme.colors.secondary);
        root.style.setProperty('--theme-accent', theme.colors.accent);
        root.style.setProperty('--theme-background', theme.colors.background);
        root.style.setProperty('--theme-surface', theme.colors.surface);
        root.style.setProperty('--theme-card-glow', theme.colors.cardGlow);
        root.style.setProperty('--theme-font', theme.font);

        // Set data attribute for CSS selectors
        body.setAttribute('data-theme', theme.name);
        body.setAttribute('data-pattern', theme.pattern);

        currentTheme = theme;
    }

    /**
     * Update theme based on current movie year
     * Returns true if decade changed
     */
    function updateForYear(year) {
        const newDecade = getDecadeForYear(year);

        if (newDecade !== currentDecade) {
            const oldDecade = currentDecade;
            currentDecade = newDecade;

            const theme = themes[newDecade];
            applyTheme(theme);

            return { changed: true, from: oldDecade, to: newDecade, theme };
        }

        return { changed: false };
    }

    /**
     * Initialize with default theme
     */
    function init() {
        // Start with 1980s theme
        applyTheme(themes['1980s']);
        currentDecade = '1980s';
    }

    /**
     * Get current theme info
     */
    function getCurrentTheme() {
        return currentTheme;
    }

    /**
     * Get current decade
     */
    function getCurrentDecade() {
        return currentDecade;
    }

    // Public API
    return {
        init,
        updateForYear,
        getThemeForYear,
        getDecadeForYear,
        getCurrentTheme,
        getCurrentDecade,
        themes
    };
})();
