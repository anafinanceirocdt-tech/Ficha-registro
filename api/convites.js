import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RH_EMAIL = 'ana.financeirocdt@gmail.com';

function adminClient() {
  if (!URL || !SERVICE_KEY) throw new Error('Configuração segura do servidor incompleta.');
  return createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export default async function handler(req, res) {
  try {
    const admin = adminClient();

    if (req.method === 'GET' && req.query?.historico === '1') {
      if (!ANON_KEY) return res.status(500).json({ error: 'Configuração de autenticação incompleta.' });
      const authHeader = req.headers.authorization || '';
      const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      if (!accessToken) return res.status(401).json({ error: 'Acesso do RH não autenticado.' });

      const authClient = createClient(URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
      if (authError || authData.user?.email?.toLowerCase() !== RH_EMAIL) {
        return res.status(403).json({ error: 'Somente o RH autorizado pode consultar os convites.' });
      }

      const { data, error } = await admin
        .from('convites_ficha')
        .select('id, token_value, rh, empresa, expires_at, used_at, criado_em, candidato_nome, ficha_id')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ convites: data || [] });
    }

    if (req.method === 'GET') {
      const token = String(req.query?.token || '');
      if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ error: 'Link inválido.' });

      const { data, error } = await admin
        .from('convites_ficha')
        .select('rh, empresa, expires_at, used_at')
        .eq('token_hash', hashToken(token))
        .maybeSingle();

      if (error) throw error;
      if (!data || data.used_at || new Date(data.expires_at).getTime() < Date.now()) {
        return res.status(410).json({ error: 'Este link é inválido, já foi utilizado ou expirou. Solicite um novo link ao RH.' });
      }
      return res.status(200).json({ rh: data.rh, empresa: data.empresa });
    }

    if (req.method === 'POST') {
      if (!ANON_KEY) return res.status(500).json({ error: 'Configuração de autenticação incompleta.' });
      const authHeader = req.headers.authorization || '';
      const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      if (!accessToken) return res.status(401).json({ error: 'Acesso do RH não autenticado.' });

      const authClient = createClient(URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
      if (authError || authData.user?.email?.toLowerCase() !== RH_EMAIL) {
        return res.status(403).json({ error: 'Somente o RH autorizado pode gerar links.' });
      }

      const { rh, empresa } = req.body || {};
      if (!rh || typeof rh !== 'object' || !empresa || typeof empresa !== 'object' || !rh.empresaId || !rh.cargo) {
        return res.status(400).json({ error: 'Dados da vaga incompletos.' });
      }

      const token = randomBytes(32).toString('hex');
      const { error } = await admin.from('convites_ficha').insert({
        token_hash: hashToken(token),
        token_value: token,
        rh,
        empresa,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (error) throw error;

      const origin = req.headers.origin || 'https://ficha-registro-eight.vercel.app';
      return res.status(201).json({ url: origin + '/?convite=' + token });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro em /api/convites:', error);
    return res.status(500).json({ error: 'Não foi possível processar o convite.' });
  }
}
