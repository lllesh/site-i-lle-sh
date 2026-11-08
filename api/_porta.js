// a porta do site: só a conta le@umbii.boo entra. a chave vale 30 dias e é assinada aqui no servidor
import crypto from 'crypto';
export const DONA = 'le@umbii.boo';
const SEGREDO = crypto.createHash('sha256').update('porta:' + (process.env.SUPABASE_SERVICE_ROLE || '')).digest('hex');
export const DIAS = 30;

const assina = (exp) => crypto.createHmac('sha256', SEGREDO).update(DONA + '|' + exp).digest('hex');
export const novaChave = () => { const exp = Date.now() + DIAS * 864e5; return exp + '.' + assina(exp) };

export function chaveValida(v) {
  const [exp, sig] = String(v || '').split('.');
  if (!exp || !sig || !(+exp > Date.now())) return false;
  const certo = assina(exp);
  return sig.length === certo.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(certo));
}

function cookie(req, nome) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + nome + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}

// quem pediu é a dona? (chave no cabeçalho x-edit-key ou no cookie "porta")
export const eDona = (req) => chaveValida(req.headers['x-edit-key']) || chaveValida(cookie(req, 'porta'));
