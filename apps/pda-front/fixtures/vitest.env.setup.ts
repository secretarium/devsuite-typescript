if (!(globalThis as any).secretariumFrontConfig) {
    (globalThis as any).secretariumFrontConfig = {
        PDA_API__URL: 'http://localhost:8080/api'
    };
}
