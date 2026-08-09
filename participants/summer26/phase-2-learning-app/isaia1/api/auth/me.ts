import { handleAuthMe } from '../../server/handlers';
import { createVercelHandler } from '../../server/vercel';

export default createVercelHandler(handleAuthMe);
