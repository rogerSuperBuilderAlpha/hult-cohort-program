import { app } from './server.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Ludwitt/Hult API on http://localhost:${PORT}`);
});
