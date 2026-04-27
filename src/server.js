const app = require('./app');
const { dbReady } = app;

const PORT = process.env.PORT || 3000;

dbReady
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log('Presiona Ctrl+C para detener');
    });
  })
  .catch((err) => {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  });
