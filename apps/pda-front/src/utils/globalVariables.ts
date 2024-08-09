const pdaApi = import.meta.env['VITE_KLAVE_API_URL'] ?? `${window.location.origin}/api`;

if (['__PDA_API__', ''].includes(window.secretariumFrontConfig.PDA_API__))
    window.secretariumFrontConfig.PDA_API__ = pdaApi;
