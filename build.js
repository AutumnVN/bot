import { build } from 'esbuild';
import { readdir } from 'fs/promises';

await build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    plugins: [importDir('commands'), importDir('modules')],
    bundle: true,
    treeShaking: true,
    sourcemap: 'linked',
    packages: 'external',
    format: 'esm',
    target: 'esnext',
    platform: 'node',
    logLevel: 'error'
});

/**
 * @param {string} namespace
 * @returns {import('esbuild').Plugin}
 */
function importDir(namespace) {
    return {
        name: `import-dir:${namespace}`,
        setup(build) {
            const filter = new RegExp(`^~${namespace}$`);
            const dir = `./src/${namespace}`;

            build.onResolve({ filter }, args => ({ path: args.path, namespace }));
            build.onLoad({ filter, namespace }, async () => {
                const files = await readdir(dir);
                const contents = files.map(file => {
                    file = file.replace(/\.ts$/, '.js');

                    return `import './${file}';`
                }).join('\n');

                return { contents, resolveDir: dir };
            });
        },
    };
}
