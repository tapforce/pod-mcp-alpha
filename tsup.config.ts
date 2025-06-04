import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/stdio.ts'],
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: 'build',
});
