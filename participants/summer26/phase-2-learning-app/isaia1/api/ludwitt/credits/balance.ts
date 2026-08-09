import { handleCreditsBalance } from '../../server/handlers';
import { createVercelHandler } from '../../server/vercel';

export default createVercelHandler(handleCreditsBalance);
