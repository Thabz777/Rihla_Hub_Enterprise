import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        envCompatible({ prefix: 'REACT_APP' })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'build',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-slot', 'lucide-react'],
                    charts: ['recharts'],
                    utils: ['axios', 'date-fns', 'zod']
                }
            }
        }
    },
    server: {
        port: 3000,
    },
    base: '/'
});
