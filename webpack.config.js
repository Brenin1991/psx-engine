const path = require('path');

module.exports = {
    entry: '../psx-engine/psx-engine/psx-engine.js', // O arquivo principal onde a função init está definida
    output: {
        filename: 'psx-engine-dist.js', // Nome do arquivo gerado
        path: path.resolve(__dirname, 'project/engine'), // Pasta de saída
        clean: false, // Limpa a pasta de saída antes de cada build
        library: {
            type: 'module', // Habilitar a saída como módulo
        },
    },
    mode: 'development', // ou 'production', conforme necessário
    experiments: {
        outputModule: true, // Habilitar a saída como módulo
    },
    resolve: {
        extensions: ['.js'], // Extensões a serem resolvidas
    },
};


