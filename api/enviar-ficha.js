import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    if (!URL || !SERVICE_KEY) throw new Error('Configuração segura do servidor incompleta.');
    const { token, candidato } = req.body || {};
    if (!/^[a-f0-9]{64}$/i.test(String(token || '')) || !candidato || typeof candidato !== 'object') {
      return res.status(400).json({ error: 'Dados do formulário inválidos.' });
    }
    if (!String(candidato.nomeCompleto || '').trim() || !String(candidato.cpf || '').trim() || candidato.autorizacaoAceita !== true) {
      return res.status(400).json({ error: 'Confira o nome, CPF e autorização de uso dos dados.' });
    }

    const admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.rpc('consumir_convite_ficha', {
      p_token_hash: hashToken(token),
      p_candidato: candidato,
    });
    if (error) {
      if (error.message?.includes('CONVITE_INVALIDO')) {
        return res.status(410).json({ error: 'Este link já foi utilizado ou expirou. Solicite um novo link ao RH.' });
      }
      throw error;
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erro em /api/enviar-ficha:', error);
    return res.status(500).json({ error: 'Não foi possível enviar a ficha. Tente novamente ou avise o RH.' });
  }
}
