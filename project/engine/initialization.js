// initialization.js
let isInitialized = false;

export async function initializeWithRetry(initFunction, maxAttempts = 5) {
  let attemptCount = 0;

  while (!isInitialized && attemptCount < maxAttempts) {
    try {
      await initFunction(); // Chama a função de inicialização
      isInitialized = true; // Marca como inicializado
      console.log('Inicialização bem-sucedida!');
    } catch (error) {
      console.error('Erro na inicialização:', error);
      attemptCount++;
      if (attemptCount >= maxAttempts) {
        console.error('Número máximo de tentativas atingido.');
        throw new Error('Falha na inicialização após várias tentativas.');
      }
    }
  }
}
