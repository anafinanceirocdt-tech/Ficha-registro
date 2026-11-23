import React, { useState, useEffect, useMemo } from 'react';
import { supabase, supabaseConfigurado } from './supabase';
import {
  Building2,
  UserPlus,
  FileText,
  Link as LinkIcon,
  Copy,
  Check,
  Printer,
  Plus,
  Trash2,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Users,
  ChevronRight,
  Search,
  Eye,
  CheckCircle2,
  Sparkles,
  FileCheck
} from 'lucide-react';

// ============================================================================
// BANCO DE DADOS DE EMPRESAS, CARGOS E SALÁRIOS (PRÉ-CONFIGURADO)
// ============================================================================
const EMPRESAS_DATA = [
  {
    id: 'amorsaude-lages',
    nome: 'Clínica AmorSaúde Lages LTDA',
    nomeCurto: 'AmorSaúde Lages',
    cnpj: '36.101.496/0001-37',
    cidadePadrao: 'Lages',
    ufPadrao: 'SC',
    tempoContratoPadrao: '45 dias',
    cargos: [
      { nome: 'Recepcionista', salario: 'R$ 2.106,00' },
      { nome: 'Assistente de agendamento', salario: 'R$ 2.106,00' },
      { nome: 'Coordenador', salario: 'R$ 3.343,68' },
      { nome: 'Líder medicina', salario: 'R$ 2.507,76' },
      { nome: 'Assistente financeiro', salario: 'R$ 2.768,99' },
      { nome: 'Biomédico', salario: 'R$ 2.106,00 + 40% insalubridade' },
      { nome: 'TSB', salario: 'R$ 2.106,00 + 40% insalubridade' },
      { nome: 'Aux. de serviços gerais', salario: 'R$ 2.106,00 + 40% insalubridade' },
    ],
  },
  {
    id: 'amorsaude-cacador',
    nome: 'Clínica AmorSaúde Caçador LTDA',
    nomeCurto: 'AmorSaúde Caçador',
    cnpj: '63.696.429/0001-85',
    cidadePadrao: 'Caçador',
    ufPadrao: 'SC',
    tempoContratoPadrao: '45 dias',
    cargos: [
      { nome: 'Recepcionista', salario: 'R$ 1.978,00' },
      { nome: 'Assistente de agendamento', salario: 'R$ 1.978,00' },
      { nome: 'Biomédico', salario: 'R$ 2.000,00 + 40% insalubridade' },
      { nome: 'TSB', salario: 'R$ 1.978,00 + 40% insalubridade' },
      { nome: 'Coordenador', salario: 'R$ 3.200,00' },
      { nome: 'Aux. serviços gerais', salario: 'R$ 1.978,00' },
    ],
  },
  {
    id: 'cdt-cacador',
    nome: 'Administradora de Cartão de Todos Caçador LTDA',
    nomeCurto: 'Cartão de Todos Caçador',
    cnpj: '64.847.568/0001-25',
    cidadePadrao: 'Caçador',
    ufPadrao: 'SC',
    tempoContratoPadrao: '15 dias',
    cargos: [
      { nome: 'Promotor de recorrência', salario: 'R$ 2.084,20' },
      { nome: 'Coordenador', salario: 'R$ 3.364,80' },
    ],
  },
  {
    id: 'cdt-lages',
    nome: 'Administradora de Cartão de Todos Lages LTDA',
    nomeCurto: 'Cartão de Todos Lages',
    cnpj: '34.834.840/0001-71',
    cidadePadrao: 'Lages',
    ufPadrao: 'SC',
    tempoContratoPadrao: '15 dias',
    cargos: [
      { nome: 'Assessor de parcerias', salario: 'R$ 3.000,00' },
      { nome: 'Coordenador financeiro', salario: 'R$ 3.680,25' },
      { nome: 'Promotor de recorrência', salario: 'R$ 2.084,20' },
      { nome: 'Coordenador', salario: 'R$ 3.680,25' },
      { nome: 'Líder', salario: 'R$ 2.786,48' },
      { nome: 'Agente de atendimento', salario: 'R$ 2.084,20' },
      { nome: 'Aux. de serviços gerais', salario: 'R$ 2.022,07' },
      { nome: 'Assistente de retenção', salario: 'R$ 2.523,60' },
    ],
  },
];

// Presets de escalas/horários (incluindo horário comercial atual e futura migração para 40h)
const HORARIOS_PRESETS = [
  {
    label: 'Padrão Atual — 08h-12h / 14h-18h e Sáb 08h-12h',
    valor: 'Segunda a Sexta das 08:00 às 12:00 e das 14:00 às 18:00, e Sábado das 08:00 às 12:00',
  },
  {
    label: 'Escala 40h Semanais — Revezamento Seg/Sáb',
    valor:
      '40h semanais - Escala de revezamento (Segunda a Sábado, com folga semanal alternada entre segunda-feira e sábado conforme escala)',
  },
  {
    label: 'Comercial 40h — Seg a Sex 08h às 17h (1h intervalo)',
    valor: '40h semanais - Segunda a Sexta-feira, das 08:00 às 17:00 (com 01h00 de intervalo)',
  },
];

const CONTRATOS_PRESETS = [
  { label: '45 dias (AmorSaúde)', valor: '45 dias' },
  { label: '15 dias (Cartão de Todos)', valor: '15 dias' },
  { label: '30 dias', valor: '30 dias' },
  { label: '60 dias', valor: '60 dias' },
  { label: '90 dias', valor: '90 dias' },
  { label: 'Indeterminado', valor: 'Prazo Indeterminado' },
];

// ============================================================================
// FUNÇÕES UTILITÁRIAS (MÁSCARAS E CODIFICAÇÃO DE URL)
// ============================================================================
const maskCPF = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const maskCEP = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');

const maskPhone = (v) => {
  const nums = v.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 10) {
    return nums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return nums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

const maskPIS = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{5})(\d)/, '$1.$2')
    .replace(/(\d{2})(\d{1})$/, '$1-$2');

const formatDateBR = (isoDate) => {
  if (!isoDate) return '';
  if (isoDate.includes('/')) return isoDate;
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Codifica dados do RH em Base64 URL-safe para o link compartilhável
const encodeRHPayload = (obj) => {
  try {
    const json = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    console.error('Erro ao codificar link:', e);
    return '';
  }
};

const decodeRHPayload = (str) => {
  try {
    const json = decodeURIComponent(escape(atob(str)));
    return JSON.parse(json);
  } catch (e) {
    console.error('Erro ao decodificar link:', e);
    return null;
  }
};

// ============================================================================
// ESTADO INICIAL DO CANDIDATO
// ============================================================================
const EMPTY_CANDIDATO = {
  nomeCompleto: '',
  dataNascimento: '',
  estadoCivil: 'Solteiro(a)',
  sexo: 'Feminino',
  raca: 'Branca',
  nacionalidade: 'Brasileira',
  naturalidadeUF: '',
  grauInstrucao: 'Ensino Médio Completo',
  nomePai: '',
  nomeMae: '',
  cpf: '',
  rg: '',
  pis: '',
  ctpsNumeroSerie: '',
  ctpsEmissaoUF: '',
  cep: '',
  endereco: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: 'SC',
  telefone: '',
  email: '',
  dependentes: [],
  autorizacaoAceita: false,
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function App() {
  // Controle de navegação entre as 3 abas principais
  const [activeTab, setActiveTab] = useState('rh'); // 'rh' | 'candidato' | 'ficha'
  const [modoCandidatoExclusivo, setModoCandidatoExclusivo] = useState(false);
  const [conviteToken, setConviteToken] = useState('');
  const [conviteValido, setConviteValido] = useState(false);
  const [rhUser, setRhUser] = useState(null);
  const [emailLogin, setEmailLogin] = useState('ana.financeirocdt@gmail.com');
  const [enviandoLogin, setEnviandoLogin] = useState(false);
  const [carregandoFichas, setCarregandoFichas] = useState(false);
  const [erroLogin, setErroLogin] = useState('');

  // Estado dos dados preenchidos pelo RH
  const [rhConfig, setRhConfig] = useState({
    empresaId: EMPRESAS_DATA[0].id,
    cargo: EMPRESAS_DATA[0].cargos[0].nome,
    salario: EMPRESAS_DATA[0].cargos[0].salario,
    dataAdmissao: new Date().toISOString().split('T')[0],
    tempoContrato: EMPRESAS_DATA[0].tempoContratoPadrao,
    horarioTrabalho: HORARIOS_PRESETS[0].valor,
  });

  // Estado dos dados preenchidos pelo Candidato
  const [candidatoData, setCandidatoData] = useState(EMPTY_CANDIDATO);

  // Estados de interface e feedback
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [filtroHistorico, setFiltroHistorico] = useState('');

  // Fichas recebidas do banco de dados Supabase
  const [fichasSalvas, setFichasSalvas] = useState([]);
  const [convitesSalvos, setConvitesSalvos] = useState([]);
  const [carregandoConvites, setCarregandoConvites] = useState(false);

  const empresaAtual = useMemo(
    () => EMPRESAS_DATA.find((e) => e.id === rhConfig.empresaId) || EMPRESAS_DATA[0],
    [rhConfig.empresaId]
  );

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const carregarHistoricoConvites = async () => {
    if (!supabase) return;
    setCarregandoConvites(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        setConvitesSalvos([]);
        return;
      }
      const response = await fetch('/api/convites?historico=1', {
        headers: { Authorization: 'Bearer ' + accessToken },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar o histórico de links.');
      setConvitesSalvos(result.convites || []);
    } catch (error) {
      showToast(error.message || 'Erro ao carregar histórico de links.', 'error');
      setConvitesSalvos([]);
    } finally {
      setCarregandoConvites(false);
    }
  };

  const copiarLinkHistorico = async (token) => {
    if (!token) {
      showToast('Este link antigo não pode ser recuperado. Gere um novo convite.', 'error');
      return;
    }
    const url = window.location.origin + '/?convite=' + token;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copiado! Você já pode enviar ao candidato.');
    } catch {
      showToast('Não foi possível copiar automaticamente. Abra o link para copiar manualmente.', 'info');
    }
  };

  // Autenticação do RH e carregamento das fichas compartilhadas no banco.
  useEffect(() => {
    if (!supabaseConfigurado || !supabase) return;

    let ativo = true;
    const carregarFichas = async (user) => {
      if (!user || user.email?.toLowerCase() !== 'ana.financeirocdt@gmail.com') {
        if (ativo) {
          setRhUser(null);
          setFichasSalvas([]);
          setConvitesSalvos([]);
        }
        return;
      }

      if (ativo) {
        setRhUser(user);
        setCarregandoFichas(true);
      }

      await carregarHistoricoConvites();
      const { data, error } = await supabase
        .from('fichas')
        .select('id, criado_em, rh, empresa, candidato')
        .order('criado_em', { ascending: false });

      if (!ativo) return;
      if (error) {
        showToast('Não foi possível carregar as fichas: ' + error.message, 'error');
        setFichasSalvas([]);
      } else {
        setFichasSalvas((data || []).map((row) => ({
          id: row.id,
          criadoEm: new Date(row.criado_em).toLocaleString('pt-BR'),
          rh: row.rh || {},
          empresa: row.empresa || {},
          candidato: row.candidato || {},
        })));
      }
      setCarregandoFichas(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      carregarFichas(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      carregarFichas(session?.user || null);
    });

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLoginRH = async (e) => {
    e.preventDefault();
    if (!supabaseConfigurado || !supabase) {
      setErroLogin('A conexão com o banco de dados não está configurada. Confira as variáveis da Vercel.');
      return;
    }
    if (emailLogin.trim().toLowerCase() !== 'ana.financeirocdt@gmail.com') {
      setErroLogin('Este e-mail não está autorizado para acessar o Painel RH.');
      return;
    }
    setEnviandoLogin(true);
    setErroLogin('');
    const { error } = await supabase.auth.signInWithOtp({
      email: emailLogin.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setEnviandoLogin(false);
    if (error) setErroLogin('Erro ao enviar o link: ' + error.message);
    else setErroLogin('Enviamos um link de acesso para seu e-mail. Abra a mensagem neste mesmo navegador para entrar no RH.');
  };

  // Carrega os dados da vaga somente por convite validado no servidor.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('convite');
    if (!token) return;

    setModoCandidatoExclusivo(true);
    setActiveTab('candidato');
    setConviteToken(token);

    const carregarConvite = async () => {
      try {
        const response = await fetch('/api/convites?token=' + encodeURIComponent(token));
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Link inválido ou expirado.');

        const empresa = EMPRESAS_DATA.find((item) => item.id === result.rh?.empresaId);
        if (!empresa || !result.rh || !result.empresa) {
          throw new Error('Os dados desta vaga não puderam ser validados. Solicite um novo link ao RH.');
        }

        setRhConfig((prev) => ({ ...prev, ...result.rh }));
        setCandidatoData((prev) => ({
          ...prev,
          cidade: prev.cidade || empresa.cidadePadrao,
          uf: prev.uf || empresa.ufPadrao,
        }));
        setConviteValido(true);
      } catch (error) {
        setConviteValido(false);
        showToast(error.message || 'Não foi possível validar o link. Solicite outro ao RH.', 'error');
      }
    };

    carregarConvite();
  }, []);

  // Quando troca a Empresa no RH, seleciona automaticamente o primeiro cargo, salário e tempo de contrato dela
  const handleEmpresaChange = (novoEmpresaId) => {
    const emp = EMPRESAS_DATA.find((e) => e.id === novoEmpresaId);
    if (!emp) return;
    const primeiroCargo = emp.cargos[0];
    setRhConfig((prev) => ({
      ...prev,
      empresaId: emp.id,
      cargo: primeiroCargo ? primeiroCargo.nome : '',
      salario: primeiroCargo ? primeiroCargo.salario : '',
      tempoContrato: emp.tempoContratoPadrao,
    }));
    setGeneratedUrl('');
  };

  // Quando troca o Cargo no RH, preenche o salário correspondente automaticamente
  const handleCargoChange = (novoCargoNome) => {
    const cargoObj = empresaAtual.cargos.find((c) => c.nome === novoCargoNome);
    setRhConfig((prev) => ({
      ...prev,
      cargo: novoCargoNome,
      salario: cargoObj ? cargoObj.salario : prev.salario,
    }));
    setGeneratedUrl('');
  };

  // Gera convite individual, armazenando os dados contratuais no servidor.
  const handleGerarLink = async () => {
    if (!supabase) {
      showToast('A conexão com o RH não está disponível. Entre novamente no painel.', 'error');
      return;
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (sessionError || !accessToken) {
        showToast('Sua sessão do RH expirou. Entre novamente para gerar o link.', 'error');
        return;
      }

      const response = await fetch('/api/convites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
        body: JSON.stringify({
          rh: { ...rhConfig },
          empresa: {
            nome: empresaAtual.nome,
            nomeCurto: empresaAtual.nomeCurto,
            cnpj: empresaAtual.cnpj,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível gerar o convite.');

      setGeneratedUrl(result.url);
      setCandidatoData({
        ...EMPTY_CANDIDATO,
        cidade: empresaAtual.cidadePadrao,
        uf: empresaAtual.ufPadrao,
      });
      await carregarHistoricoConvites();
      showToast('Link individual criado e salvo no histórico. Ele expira em 7 dias e só pode ser usado uma vez!');
    } catch (error) {
      showToast(error.message || 'Erro ao gerar link seguro.', 'error');
    }
  };

  const handleCopiarLink = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopiedLink(true);
      showToast('Link copiado para a área de transferência!');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      showToast('Selecione e copie o link manualmente.', 'info');
    }
  };

  // Busca automática de endereço pelo CEP via ViaCEP
  const handleCepBlur = async (cepValue) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setCandidatoData((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
        }));
      }
    } catch {
      // Silencioso caso esteja offline
    } finally {
      setBuscandoCep(false);
    }
  };

  // Gerenciamento dinâmico de dependentes (filhos)
  const adicionarDependente = () => {
    setCandidatoData((prev) => ({
      ...prev,
      dependentes: [
        ...prev.dependentes,
        { id: Date.now(), nomeCompleto: '', dataNascimento: '', cpf: '', naturalidade: '' },
      ],
    }));
  };

  const atualizarDependente = (id, campo, valor) => {
    setCandidatoData((prev) => ({
      ...prev,
      dependentes: prev.dependentes.map((dep) =>
        dep.id === id ? { ...dep, [campo]: valor } : dep
      ),
    }));
  };

  const removerDependente = (id) => {
    setCandidatoData((prev) => ({
      ...prev,
      dependentes: prev.dependentes.filter((dep) => dep.id !== id),
    }));
  };

  // Envia a ficha concluída para o banco compartilhado com o RH.
  const handleConcluirCandidato = async (e) => {
    e.preventDefault();
    if (!candidatoData.nomeCompleto.trim() || !candidatoData.cpf.trim()) {
      showToast('Preencha pelo menos seu Nome Completo e CPF para gerar a ficha.', 'error');
      return;
    }
    if (!candidatoData.autorizacaoAceita) {
      showToast('Por favor, marque a caixa de autorização de uso dos dados no final do formulário.', 'error');
      return;
    }
    if (!conviteToken || !conviteValido) {
      showToast('Este formulário precisa ser aberto pelo link válido enviado pelo RH. Solicite um novo convite.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/enviar-ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: conviteToken,
          candidato: { ...candidatoData },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'A ficha não foi enviada. Avise o RH.');

      setConviteValido(false);
    } catch (error) {
      console.error('Erro ao enviar ficha:', error);
      showToast(error.message || 'A ficha não foi enviada. Tente novamente ou avise o RH.', 'error');
      return;
    }

    setActiveTab('ficha');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Ficha enviada ao RH com sucesso! Agora você pode salvar/imprimir seu comprovante.');
  };

  // Abre uma ficha salva do histórico para visualização/impressão
  const handleVisualizarFichaHistorico = (ficha) => {
    setRhConfig(ficha.rh);
    setCandidatoData(ficha.candidato);
    setActiveTab('ficha');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluirFichaHistorico = async (id) => {
    if (!supabase || !rhUser) return;
    const { error } = await supabase.from('fichas').delete().eq('id', id);
    if (error) {
      showToast('Não foi possível excluir a ficha: ' + error.message, 'error');
      return;
    }
    setFichasSalvas((atuais) => atuais.filter((f) => f.id !== id));
    showToast('Ficha excluída do banco de dados.', 'info');
  };

  const fichasFiltradas = fichasSalvas.filter((f) => {
    const q = filtroHistorico.toLowerCase();
    return (
      (f.candidato?.nomeCompleto || '').toLowerCase().includes(q) ||
      (f.empresa?.nomeCurto || '').toLowerCase().includes(q) ||
      (f.rh?.cargo || '').toLowerCase().includes(q)
    );
  });

  if (!modoCandidatoExclusivo && !rhUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Acesso do RH</h1>
              <p className="text-xs text-slate-500">Portal Admissão RH • Sayddel</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-5">
            Para acessar as fichas recebidas e configurar admissões, solicite um link seguro de acesso por e-mail.
          </p>
          <form onSubmit={handleLoginRH} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">E-mail autorizado</label>
              <input
                type="email"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={enviandoLogin}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm py-3"
            >
              {enviandoLogin ? 'Enviando link...' : 'Enviar link de acesso'}
            </button>
          </form>
          {erroLogin && <p className="mt-4 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">{erroLogin}</p>}
          {!supabaseConfigurado && <p className="mt-4 text-xs text-rose-700">Banco de dados não configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Estilos específicos para impressão limpa em folha A4 */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .ficha-a4-sheet {
            box-shadow: none !important;
            border: 1.5px solid #000 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 14px !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* NOTIFICAÇÃO FLUTUANTE (TOAST) */}
      {toastMsg && (
        <div className="no-print fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-slate-900 text-white border-slate-700 animate-fade-in">
          {toastMsg.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMsg.msg}</span>
        </div>
      )}

      {/* CABEÇALHO SUPERIOR E NAVEGAÇÃO (OCULTO NA IMPRESSÃO) */}
      <header className="no-print bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Portal Admissão RH
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sayddel Contabilidade
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Clínica AmorSaúde &amp; Administradora Cartão de Todos (Lages / Caçador)
              </p>
            </div>
          </div>

          {/* Abas de Navegação */}
          <nav className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
            {!modoCandidatoExclusivo && (
              <button
                type="button"
                onClick={() => setActiveTab('rh')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'rh'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>1. Painel RH</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('candidato')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'candidato'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{modoCandidatoExclusivo ? 'Formulário de Admissão' : '2. Form Candidato'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ficha')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ficha'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{modoCandidatoExclusivo ? 'Visualizar Ficha' : '3. Ficha Sayddel (PDF)'}</span>
            </button>


          </nav>
          {rhUser && !modoCandidatoExclusivo && (
            <button type="button" onClick={() => supabase.auth.signOut()} className="self-end md:self-auto text-xs text-slate-300 hover:text-white underline">Sair do RH</button>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 py-6 print-only-container">
        {/* ====================================================================
            ABA 1: PAINEL DO RH (CONFIGURAÇÃO DA VAGA + HISTÓRICO)
        ==================================================================== */}
        {activeTab === 'rh' && (
          <div className="space-y-6">
            {/* Card Principal de Configuração */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    Configurar Nova Admissão e Gerar Link
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Selecione a empresa e o cargo. O sistema puxa automaticamente CNPJ, salário e escala padrão.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  <Building2 className="w-3.5 h-3.5" />4 Empresas Cadastradas
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* Seleção Visual das 4 Empresas */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    1. Selecione a Empresa Contratante
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {EMPRESAS_DATA.map((emp) => {
                      const selecionada = emp.id === rhConfig.empresaId;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleEmpresaChange(emp.id)}
                          className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                            selecionada
                              ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                emp.id.startsWith('amorsaude')
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {emp.id.startsWith('amorsaude') ? 'AmorSaúde' : 'Cartão de Todos'}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                selecionada
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {selecionada && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 leading-snug">
                              {emp.nomeCurto}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 mt-1">
                              CNPJ: {emp.cnpj}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid de Cargo, Salário e Data de Admissão */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cargo / Função */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      2. Cargo / Função ({empresaAtual.nomeCurto})
                    </label>
                    <div className="relative">
                      <select
                        value={rhConfig.cargo}
                        onChange={(e) => handleCargoChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {empresaAtual.cargos.map((c) => (
                          <option key={c.nome} value={c.nome}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Salário (Puxado automaticamente, mas editável) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      3. Salário Base / Adicionais
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={rhConfig.salario}
                        onChange={(e) =>
                          setRhConfig((prev) => ({ ...prev, salario: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-emerald-50/30 pl-9 pr-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  {/* Data de Admissão */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      4. Data de Admissão
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={rhConfig.dataAdmissao}
                        onChange={(e) =>
                          setRhConfig((prev) => ({ ...prev, dataAdmissao: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Tempo de Contrato (Experiência) Automático por Empresa + Atalhos Rápidos */}
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-700" />
                      5. Tempo de Contrato (Experiência) — Automático por Empresa
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CONTRATOS_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setRhConfig((prev) => ({ ...prev, tempoContrato: preset.valor }));
                            setGeneratedUrl('');
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            rhConfig.tempoContrato === preset.valor
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-emerald-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={rhConfig.tempoContrato}
                    onChange={(e) => {
                      setRhConfig((prev) => ({ ...prev, tempoContrato: e.target.value }));
                      setGeneratedUrl('');
                    }}
                    placeholder="Ex: 45 dias"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[11px] text-slate-500">
                    Padrão automático: <strong>45 dias</strong> para unidades Clínica AmorSaúde e{' '}
                    <strong>15 dias</strong> para unidades Administradora Cartão de Todos. Edite livremente acima caso haja exceção.
                  </p>
                </div>

                {/* Horário de Trabalho e Escala (com atalhos para futura migração para 40h) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-700" />
                      6. Horário de Trabalho / Escala Contratual
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {HORARIOS_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRhConfig((prev) => ({ ...prev, horarioTrabalho: preset.valor }));
                            setGeneratedUrl('');
                          }}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            rhConfig.horarioTrabalho === preset.valor
                              ? 'bg-blue-900 text-white border-blue-900'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label.split('—')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={rhConfig.horarioTrabalho}
                    onChange={(e) => {
                      setRhConfig((prev) => ({ ...prev, horarioTrabalho: e.target.value }));
                      setGeneratedUrl('');
                    }}
                    placeholder="Ex: Segunda a Sexta das 08:00 às 12:00 e das 14:00 às 18:00, e Sábado das 08:00 às 12:00"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />

                  <p className="text-xs text-slate-600 flex items-start gap-2 bg-blue-50/80 border border-blue-200/80 p-2.5 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Campo editável:</strong> O horário acima já vai preenchido no link do candidato. Quando migrarem para a escala de <strong>40h semanais</strong>, basta editar o texto acima ou clicar no atalho <em>"Escala 40h Semanais"</em>.
                    </span>
                  </p>
                </div>

                {/* Botões de Ação do RH */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleGerarLink}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Gerar Link Pré-Preenchido para Candidato
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCandidatoData((prev) => ({
                        ...prev,
                        cidade: prev.cidade || empresaAtual.cidadePadrao,
                        uf: prev.uf || empresaAtual.ufPadrao,
                      }));
                      setActiveTab('candidato');
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all cursor-pointer"
                  >
                    Abrir Tela do Candidato Agora
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Caixa de Link Gerado para Copiar e Enviar no WhatsApp */}
                {generatedUrl && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Link Exclusivo da Vaga Pronto! Envie no WhatsApp do Candidato:
                      </span>
                      <span className="text-xs text-emerald-700 font-medium">
                        {empresaAtual.nomeCurto} • {rhConfig.cargo}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedUrl}
                        onClick={(e) => e.target.select()}
                        className="flex-1 text-xs font-mono bg-white border border-emerald-300 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopiarLink}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-4 h-4" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copiar Link
                          </>
                        )}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Olá! Segue o link para preenchimento da sua Ficha de Admissão (${empresaAtual.nomeCurto} - ${rhConfig.cargo}): ${generatedUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" /> Enviar WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* HISTÓRICO DE LINKS ENVIADOS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-emerald-700" />
                    Links Enviados ({convitesSalvos.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Os convites ficam salvos aqui mesmo que você feche o navegador. Copie novamente o link quando precisar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={carregarHistoricoConvites}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Atualizar histórico
                </button>
              </div>
              {carregandoConvites ? (
                <div className="p-6 text-center text-sm text-slate-500">Carregando links enviados...</div>
              ) : convitesSalvos.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Nenhum convite registrado ainda. Os próximos links gerados aparecerão aqui.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {convitesSalvos.map((convite) => {
                    const expirado = new Date(convite.expires_at).getTime() < Date.now();
                    const recebido = Boolean(convite.used_at);
                    const status = recebido
                      ? 'Ficha recebida'
                      : expirado
                        ? 'Link expirado'
                        : convite.token_value
                          ? 'Aguardando preenchimento'
                          : 'Link antigo — não recuperável';
                    const dataEnvio = convite.criado_em
                      ? new Date(convite.criado_em).toLocaleString('pt-BR')
                      : 'Data não disponível';
                    const urlConvite = convite.token_value
                      ? window.location.origin + '/?convite=' + convite.token_value
                      : '';
                    return (
                      <div key={convite.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {convite.candidato_nome || 'Candidato não identificado'}
                            </span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${recebido ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : expirado ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {convite.empresa?.nomeCurto || convite.empresa?.nome || 'Empresa'} • Cargo: {convite.rh?.cargo || 'Não informado'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Enviado em: {dataEnvio}
                            {convite.expires_at ? ' • Expira em: ' + new Date(convite.expires_at).toLocaleDateString('pt-BR') : ''}
                          </p>
                        </div>
                        {urlConvite && !recebido && !expirado ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => copiarLinkHistorico(convite.token_value)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copiar link
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(urlConvite, '_blank', 'noopener,noreferrer')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Abrir
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HISTÓRICO DE FICHAS RECEBIDAS / SALVAS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-900" />
                    Fichas Recebidas ({fichasSalvas.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acesse rapidamente qualquer ficha concluída para emitir o PDF da Sayddel Contabilidade.
                  </p>
                </div>
                {fichasSalvas.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={filtroHistorico}
                      onChange={(e) => setFiltroHistorico(e.target.value)}
                      placeholder="Buscar por nome, empresa..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>

              {fichasFiltradas.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium text-slate-600">
                    {carregandoFichas ? 'Carregando fichas recebidas...' : 'Nenhuma ficha recebida ainda.'}
                  </p>
                  <p className="text-xs mt-1">
                    Quando um candidato concluir e enviar o formulário, a ficha aparecerá aqui para conferência e impressão.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {fichasFiltradas.map((ficha) => (
                    <div
                      key={ficha.id}
                      className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {ficha.candidato.nomeCompleto}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {ficha.empresa.nomeCurto}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Cargo: <strong>{ficha.rh.cargo}</strong> • Admissão:{' '}
                          {formatDateBR(ficha.rh.dataAdmissao)} • Preenchido em: {ficha.criadoEm}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVisualizarFichaHistorico(ficha)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Abrir Ficha / PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExcluirFichaHistorico(ficha.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir do histórico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            ABA 2: FORMULÁRIO DO CANDIDATO (PREENCHIMENTO PESSOAL)
        ==================================================================== */}
        {activeTab === 'candidato' && (
          <form onSubmit={handleConcluirCandidato} className="space-y-6">
            {/* Banner de Resumo Travado da Vaga (Definido pelo RH) */}
            <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/15">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Dados da Vaga Pré-Preenchidos (RH)
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold mt-0.5">{empresaAtual.nome}</h2>
                  <p className="text-xs text-slate-300 font-mono">CNPJ: {empresaAtual.cnpj}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-300 self-start">
                  <ShieldCheck className="w-4 h-4" />
                  Ambiente Seguro de Admissão
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/10 rounded-xl p-3">
                  <span className="text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Cargo / Função
                  </span>
                  <strong className="text-sm text-white">{rhConfig.cargo}</strong>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <span className="text-slate-300 block mb-0.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Salário
                  </span>
                  <strong className="text-sm text-white">{rhConfig.salario}</strong>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <span className="text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Data de Admissão
                  </span>
                  <strong className="text-sm text-white">
                    {formatDateBR(rhConfig.dataAdmissao) || 'A definir'}
                  </strong>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <span className="text-slate-300 block mb-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Tempo de Contrato
                  </span>
                  <strong className="text-sm text-white">{rhConfig.tempoContrato}</strong>
                </div>
              </div>
              <div className="mt-3 bg-white/5 rounded-xl p-3 text-xs">
                <span className="text-slate-300 font-semibold">Horário / Escala: </span>
                <span className="text-white">{rhConfig.horarioTrabalho}</span>
              </div>
            </div>

            {/* SEÇÃO A: DADOS PESSOAIS E FILIAÇÃO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">1. Dados Pessoais e Filiação</h3>
                <p className="text-xs text-slate-500">
                  Preencha exatamente conforme consta nos seus documentos oficiais.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.nomeCompleto}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, nomeCompleto: e.target.value }))
                    }
                    placeholder="Ex: Maria Carolina da Silva"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={candidatoData.dataNascimento}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, dataNascimento: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Civil *
                  </label>
                  <select
                    value={candidatoData.estadoCivil}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, estadoCivil: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option>Solteiro(a)</option>
                    <option>Casado(a)</option>
                    <option>União Estável</option>
                    <option>Divorciado(a)</option>
                    <option>Viúvo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo *</label>
                  <select
                    value={candidatoData.sexo}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, sexo: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option>Feminino</option>
                    <option>Masculino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Raça / Cor (eSocial) *
                  </label>
                  <select
                    value={candidatoData.raca}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, raca: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option>Branca</option>
                    <option>Parda</option>
                    <option>Preta</option>
                    <option>Amarela</option>
                    <option>Indígena</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nacionalidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.nacionalidade}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, nacionalidade: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Naturalidade (Cidade / UF) *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.naturalidadeUF}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, naturalidadeUF: e.target.value }))
                    }
                    placeholder="Ex: Lages / SC"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grau de Instrução *
                  </label>
                  <select
                    value={candidatoData.grauInstrucao}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, grauInstrucao: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option>Ensino Fundamental Incompleto</option>
                    <option>Ensino Fundamental Completo</option>
                    <option>Ensino Médio Incompleto</option>
                    <option>Ensino Médio Completo</option>
                    <option>Ensino Técnico Completo</option>
                    <option>Ensino Superior Incompleto</option>
                    <option>Ensino Superior Completo</option>
                    <option>Pós-Graduação / Especialização</option>
                  </select>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Completo da Mãe *
                    </label>
                    <input
                      type="text"
                      required
                      value={candidatoData.nomeMae}
                      onChange={(e) =>
                        setCandidatoData((prev) => ({ ...prev, nomeMae: e.target.value }))
                      }
                      placeholder="Nome completo da mãe"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Completo do Pai
                    </label>
                    <input
                      type="text"
                      value={candidatoData.nomePai}
                      onChange={(e) =>
                        setCandidatoData((prev) => ({ ...prev, nomePai: e.target.value }))
                      }
                      placeholder="Nome completo do pai (se constar no RG)"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO B: DOCUMENTAÇÃO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">2. Documentação</h3>
                <p className="text-xs text-slate-500">
                  Informe a data de emissão da sua Carteira de Trabalho.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    value={candidatoData.cpf}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, cpf: maskCPF(e.target.value) }))
                    }
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">RG *</label>
                  <input
                    type="text"
                    required
                    value={candidatoData.rg}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, rg: e.target.value }))
                    }
                    placeholder="Número do RG"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIS / PASEP
                  </label>
                  <input
                    type="text"
                    value={candidatoData.pis}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, pis: maskPIS(e.target.value) }))
                    }
                    placeholder="000.00000.00-0"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Emissão da CTPS *
                  </label>
                  <input
                    type="date"
                    required
                    value={candidatoData.ctpsEmissaoUF}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, ctpsEmissaoUF: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO C: ENDEREÇO E CONTATO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">3. Endereço e Contato</h3>
                <p className="text-xs text-slate-500">
                  Digite o CEP para preenchimento automático da rua e bairro.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CEP * {buscandoCep && <span className="text-emerald-600">(Buscando...)</span>}
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.cep}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, cep: maskCEP(e.target.value) }))
                    }
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    placeholder="00000-000"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço (Rua/Av. e Número) *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.endereco}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, endereco: e.target.value }))
                    }
                    placeholder="Ex: Rua Hercílio Luz, nº 240"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={candidatoData.complemento}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, complemento: e.target.value }))
                    }
                    placeholder="Apto, Bloco, Casa..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.bairro}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, bairro: e.target.value }))
                    }
                    placeholder="Centro"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.cidade}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, cidade: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UF *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={candidatoData.uf}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, uf: e.target.value.toUpperCase() }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidatoData.telefone}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({
                        ...prev,
                        telefone: maskPhone(e.target.value),
                      }))
                    }
                    placeholder="(49) 99999-9999"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail para contato *
                  </label>
                  <input
                    type="email"
                    required
                    value={candidatoData.email}
                    onChange={(e) =>
                      setCandidatoData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="seuemail@exemplo.com"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO D: DEPENDENTES / FILHOS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    4. Dependentes / Filhos (Salário Família e IRRF)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adicione seus filhos menores de 14 anos ou dependentes legais, se houver.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={adicionarDependente}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition-colors self-start cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Filho / Dependente
                </button>
              </div>

              {candidatoData.dependentes.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Nenhum dependente adicionado. Caso não possua filhos/dependentes, siga para a autorização abaixo.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidatoData.dependentes.map((dep, index) => (
                    <div
                      key={dep.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
                    >
                      <div className="lg:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Nome Completo do Dependente #{index + 1}
                        </label>
                        <input
                          type="text"
                          required
                          value={dep.nomeCompleto}
                          onChange={(e) =>
                            atualizarDependente(dep.id, 'nomeCompleto', e.target.value)
                          }
                          placeholder="Nome completo"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Data de Nascimento
                        </label>
                        <input
                          type="date"
                          required
                          value={dep.dataNascimento}
                          onChange={(e) =>
                            atualizarDependente(dep.id, 'dataNascimento', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          CPF do Filho(a)
                        </label>
                        <input
                          type="text"
                          required
                          value={dep.cpf}
                          onChange={(e) =>
                            atualizarDependente(dep.id, 'cpf', maskCPF(e.target.value))
                          }
                          placeholder="000.000.000-00"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Naturalidade
                        </label>
                        <input
                          type="text"
                          value={dep.naturalidade}
                          onChange={(e) =>
                            atualizarDependente(dep.id, 'naturalidade', e.target.value)
                          }
                          placeholder="Cidade/UF"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div className="lg:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removerDependente(dep.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Remover dependente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO E: TERMO DE AUTORIZAÇÃO LGPD E ENVIO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={candidatoData.autorizacaoAceita}
                  onChange={(e) =>
                    setCandidatoData((prev) => ({
                      ...prev,
                      autorizacaoAceita: e.target.checked,
                    }))
                  }
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Declaro que as informações acima são verdadeiras e{' '}
                  <strong>
                    autorizo o uso das informações acima para Contrato de Trabalho junto à empresa{' '}
                    {empresaAtual.nome} CNPJ nº {empresaAtual.cnpj}
                  </strong>
                  , bem como seu envio à contabilidade responsável (Sayddel Contabilidade Digitalizada).
                </span>
              </label>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <FileCheck className="w-5 h-5" />
                  Concluir e Gerar Ficha de Registro
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ====================================================================
            ABA 3: FICHA DE REGISTRO OFICIAL (LAYOUT SAYDDEL CONTABILIDADE A4)
        ==================================================================== */}
        {activeTab === 'ficha' && (
          <div className="space-y-5">
            {/* Barra de Ferramentas de Impressão / PDF (Oculta na impressão) */}
            <div className="no-print bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Ficha de Registro Pronta para Emissão
                </h2>
                <p className="text-xs text-slate-500">
                  Clique no botão ao lado para salvar em <strong>PDF (A4)</strong> e enviar para assinatura digital (Gov.br, ZapSign, Autentique ou Clicksign).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('candidato')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar Dados
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Salvar em PDF / Imprimir Ficha
                </button>
              </div>
            </div>

            {/* FOLHA OFICIAL A4 - SAYDDEL CONTABILIDADE */}
            <div className="ficha-a4-sheet bg-white text-black mx-auto max-w-[210mm] p-6 sm:p-8 shadow-lg border border-slate-400">
              {/* Cabeçalho Oficial Sayddel */}
              <div className="border-2 border-black">
                <div className="grid grid-cols-12 border-b-2 border-black">
                  <div className="col-span-4 border-r-2 border-black p-3 flex flex-col justify-center items-center text-center bg-slate-50">
                    <span className="text-2xl font-black tracking-widest text-slate-900 leading-none">
                      SAYDDEL
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-600 mt-1">
                      contabilidade digitalizada
                    </span>
                  </div>
                  <div className="col-span-8 p-3 flex flex-col justify-center items-center text-center">
                    <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
                      FICHA DE REGISTRO DE EMPREGADO
                    </h1>
                    <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                      DADOS PARA REGISTRO E ADMISSÃO
                    </p>
                  </div>
                </div>

                {/* BLOCO 1: DADOS PESSOAIS E FILIAÇÃO */}
                <div className="bg-slate-200 border-b border-black px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  1. Identificação e Filiação
                </div>

                <div className="grid grid-cols-12 border-b border-black text-xs">
                  <div className="col-span-8 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Nome Completo
                    </span>
                    <span className="font-bold text-sm uppercase">
                      {candidatoData.nomeCompleto || ' '}
                    </span>
                  </div>
                  <div className="col-span-4 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Data de Nascimento
                    </span>
                    <span className="font-semibold">
                      {formatDateBR(candidatoData.dataNascimento) || ' '}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black text-xs">
                  <div className="col-span-3 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Estado Civil
                    </span>
                    <span className="font-semibold">{candidatoData.estadoCivil}</span>
                  </div>
                  <div className="col-span-2 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Sexo
                    </span>
                    <span className="font-semibold">{candidatoData.sexo}</span>
                  </div>
                  <div className="col-span-2 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Raça / Cor
                    </span>
                    <span className="font-semibold">{candidatoData.raca}</span>
                  </div>
                  <div className="col-span-5 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Nacionalidade
                    </span>
                    <span className="font-semibold">{candidatoData.nacionalidade}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black text-xs">
                  <div className="col-span-5 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Naturalidade / UF
                    </span>
                    <span className="font-semibold">{candidatoData.naturalidadeUF || ' '}</span>
                  </div>
                  <div className="col-span-7 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Grau de Instrução
                    </span>
                    <span className="font-semibold">{candidatoData.grauInstrucao}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b-2 border-black text-xs">
                  <div className="col-span-6 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Nome da Mãe
                    </span>
                    <span className="font-semibold uppercase">{candidatoData.nomeMae || ' '}</span>
                  </div>
                  <div className="col-span-6 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Nome do Pai
                    </span>
                    <span className="font-semibold uppercase">{candidatoData.nomePai || ' '}</span>
                  </div>
                </div>

                {/* BLOCO 2: DOCUMENTAÇÃO */}
                <div className="bg-slate-200 border-b border-black px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  2. Documentos Pessoais
                </div>

                <div className="grid grid-cols-12 border-b border-black text-xs">
                  <div className="col-span-4 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">CPF</span>
                    <span className="font-bold font-mono">{candidatoData.cpf || ' '}</span>
                  </div>
                  <div className="col-span-4 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">RG</span>
                    <span className="font-semibold">{candidatoData.rg || ' '}</span>
                  </div>
                  <div className="col-span-4 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">PIS</span>
                    <span className="font-semibold font-mono">{candidatoData.pis || ' '}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b-2 border-black text-xs">
                  <div className="col-span-12 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Data de Emissão da CTPS
                    </span>
                    <span className="font-semibold">{formatDateBR(candidatoData.ctpsEmissaoUF) || ' '}</span>
                  </div>
                </div>

                {/* BLOCO 3: ENDEREÇO E CONTATO */}
                <div className="bg-slate-200 border-b border-black px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  3. Endereço Residencial e Contato
                </div>

                <div className="grid grid-cols-12 border-b border-black text-xs">
                  <div className="col-span-8 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Endereço
                    </span>
                    <span className="font-semibold">{candidatoData.endereco || ' '}</span>
                  </div>
                  <div className="col-span-4 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Complemento
                    </span>
                    <span className="font-semibold">{candidatoData.complemento || ' '}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b-2 border-black text-xs">
                  <div className="col-span-3 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Bairro
                    </span>
                    <span className="font-semibold">{candidatoData.bairro || ' '}</span>
                  </div>
                  <div className="col-span-4 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Cidade / UF
                    </span>
                    <span className="font-semibold">
                      {candidatoData.cidade} {candidatoData.uf ? `- ${candidatoData.uf}` : ''}
                    </span>
                  </div>
                  <div className="col-span-2 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">CEP</span>
                    <span className="font-semibold font-mono">{candidatoData.cep || ' '}</span>
                  </div>
                  <div className="col-span-3 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Telefone
                    </span>
                    <span className="font-semibold">{candidatoData.telefone || ' '}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b-2 border-black text-xs">
                  <div className="col-span-12 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      E-mail para contato
                    </span>
                    <span className="font-semibold">{candidatoData.email || ' '}</span>
                  </div>
                </div>

                {/* BLOCO 4: DADOS PARA REGISTRO / CONTRATUAIS (PREENCHIDOS PELO RH) */}
                <div className="bg-slate-200 border-b border-black px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  4. Dados para Registro (Uso Exclusivo da Empresa / RH)
                </div>

                <div className="grid grid-cols-12 border-b border-black text-xs">
                  <div className="col-span-3 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Data de Admissão
                    </span>
                    <span className="font-bold">
                      {formatDateBR(rhConfig.dataAdmissao) || ' '}
                    </span>
                  </div>
                  <div className="col-span-5 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Cargo / Função
                    </span>
                    <span className="font-bold uppercase">{rhConfig.cargo}</span>
                  </div>
                  <div className="col-span-4 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Salário
                    </span>
                    <span className="font-bold">{rhConfig.salario}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b-2 border-black text-xs">
                  <div className="col-span-4 border-r border-black p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Tempo / Tipo de Contrato
                    </span>
                    <span className="font-semibold">{rhConfig.tempoContrato}</span>
                  </div>
                  <div className="col-span-8 p-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-600">
                      Horário de Trabalho / Escala
                    </span>
                    <span className="font-semibold">{rhConfig.horarioTrabalho}</span>
                  </div>
                </div>

                {/* BLOCO 5: DEPENDENTES FILHOS */}
                <div className="bg-slate-200 border-b border-black px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                  5. Dependentes / Filhos
                </div>

                <div className="border-b-2 border-black">
                  <div className="grid grid-cols-12 border-b border-black bg-slate-50 text-[9px] font-extrabold uppercase">
                    <div className="col-span-5 border-r border-black px-2 py-1">Nome Completo</div>
                    <div className="col-span-2 border-r border-black px-2 py-1">
                      Data de Nascimento
                    </div>
                    <div className="col-span-3 border-r border-black px-2 py-1">CPF</div>
                    <div className="col-span-2 px-2 py-1">Naturalidade</div>
                  </div>

                  {candidatoData.dependentes.length > 0 ? (
                    candidatoData.dependentes.map((dep, idx) => (
                      <div
                        key={dep.id || idx}
                        className="grid grid-cols-12 border-b last:border-b-0 border-black text-xs"
                      >
                        <div className="col-span-5 border-r border-black px-2 py-1.5 font-semibold uppercase">
                          {dep.nomeCompleto}
                        </div>
                        <div className="col-span-2 border-r border-black px-2 py-1.5">
                          {formatDateBR(dep.dataNascimento)}
                        </div>
                        <div className="col-span-3 border-r border-black px-2 py-1.5 font-mono">
                          {dep.cpf}
                        </div>
                        <div className="col-span-2 px-2 py-1.5">{dep.naturalidade}</div>
                      </div>
                    ))
                  ) : (
                    /* Linhas em branco padrão caso não haja dependentes */
                    <>
                      <div className="grid grid-cols-12 border-b border-black text-xs h-6">
                        <div className="col-span-5 border-r border-black px-2 py-1 text-slate-400 italic text-[10px]">
                          Não possui dependentes declarados
                        </div>
                        <div className="col-span-2 border-r border-black px-2 py-1" />
                        <div className="col-span-3 border-r border-black px-2 py-1" />
                        <div className="col-span-2 px-2 py-1" />
                      </div>
                      <div className="grid grid-cols-12 text-xs h-6">
                        <div className="col-span-5 border-r border-black px-2 py-1" />
                        <div className="col-span-2 border-r border-black px-2 py-1" />
                        <div className="col-span-3 border-r border-black px-2 py-1" />
                        <div className="col-span-2 px-2 py-1" />
                      </div>
                    </>
                  )}
                </div>

                {/* BLOCO 6: TERMO DE AUTORIZAÇÃO E ASSINATURA */}
                <div className="p-4 space-y-6 bg-white">
                  <p className="text-xs leading-relaxed text-justify font-medium">
                    Autorizo o uso das informações acima para Contrato de Trabalho junto à empresa{' '}
                    <strong className="uppercase">{empresaAtual.nome}</strong> CNPJ nº{' '}
                    <strong>{empresaAtual.cnpj}</strong>.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs">
                    <div>
                      <span>
                        {empresaAtual.cidadePadrao}/{empresaAtual.ufPadrao},{' '}
                        {formatDateBR(rhConfig.dataAdmissao) || '____/____/2026'}.
                      </span>
                    </div>

                    <div className="w-full sm:w-80 text-center">
                      <div className="border-t border-black pt-1.5 font-bold uppercase text-[11px]">
                        Assinatura do Funcionário
                      </div>
                      {candidatoData.nomeCompleto && (
                        <div className="text-[10px] text-slate-600 uppercase mt-0.5">
                          {candidatoData.nomeCompleto}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
