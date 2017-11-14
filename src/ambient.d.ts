declare module 'pkg-dir' {
    const M: {
        (fromPath?: string): Promise<string | null>;
        sync(fromPath?: string): string | null;
    }
    export = M;
}
