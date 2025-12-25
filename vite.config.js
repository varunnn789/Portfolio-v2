/**
 * ============================================
 * VITE CONFIGURATION
 * ============================================
 * 
 * LEARNING: Build Tools
 * 
 * Vite is a modern build tool that:
 * 1. Provides a development server with hot reload
 * 2. Bundles your code for production
 * 3. Handles ES modules natively (no bundling during dev = FAST)
 * 
 * This config file is optional - Vite works without it.
 * But we add it for fine-tuned control.
 */

import { defineConfig } from 'vite';

export default defineConfig({
    // Base URL for deployment (change for GitHub Pages subdirectory)
    base: './',

    // Development server options
    server: {
        port: 3000,           // Custom port
        open: true,           // Auto-open browser
        host: true            // Allow access from network (for mobile testing)
    },

    // Build options for production
    build: {
        outDir: 'dist',       // Output directory
        sourcemap: true,      // Generate source maps for debugging
        minify: 'terser',     // Minify for smaller file size
        target: 'esnext'      // Modern browsers only
    }
});
