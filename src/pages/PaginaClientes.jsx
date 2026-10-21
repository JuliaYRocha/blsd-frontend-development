import React, { useEffect, useState } from 'react';
import BarraDeNavegacaoLateral from '../components/BarraDeNavegacaoLateral';
import CartaoKPIClientes from '../components/CartaoKPIClientes';
import TabelaClientes from '../components/TabelaClientes';
import { listarClientes } from '../services/clienteService';
import useDebounce from '../hooks/useDebounce';

/* ── ícones ── */
const iconePlus = (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const iconeBusca = (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const iconeChevronBaixo = (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const iconeTendencia = (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);
const iconeEnvolvimento = (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const iconeAlvo = (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const statusOpcoes = ['Todos'];

export default function PaginaClientes() {
  const [clientes, setClientes]             = useState([]);
  const [carregando, setCarregando]         = useState(true);
  const [erro, setErro]                     = useState(null);
  const [busca, setBusca]                   = useState('');
  const [paginaAtual, setPaginaAtual]       = useState(0);
  const [totalPaginas, setTotalPaginas]     = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [tamanhoPagina]                     = useState(8);
  const [filtroStatus, setFiltroStatus]     = useState('Todos');
  const [dropStatus, setDropStatus]         = useState(false);
  const [versao, setVersao]                 = useState(0); // força recarregar a lista

  // espera o usuário parar de digitar antes de buscar
  const buscaDebounced = useDebounce(busca, 400);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        setCarregando(true);
        setErro(null);
        const resposta = await listarClientes({
          page: paginaAtual,
          size: tamanhoPagina,
          busca: buscaDebounced,
        });
        if (!ativo) return;
        setClientes(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalElementos(resposta.totalElements);
      } catch (e) {
        if (!ativo) return;
        console.error('Erro ao carregar clientes:', e);
        setErro('Não foi possível carregar os clientes.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, [paginaAtual, tamanhoPagina, buscaDebounced, versao]);

  // ── KPIs derivados do total real (todas as páginas) ──
  const total    = totalElementos;
  const ativos   = totalElementos;
  const retencao = total > 0 ? Math.round((ativos / total) * 100) : 0;

  // ao buscar, volta para a primeira página
  function handleBusca(valor) {
    setBusca(valor);
    setPaginaAtual(0);
  }

  // após remover: se era o último item da página, volta uma página; senão recarrega
  function handleRemover(id) {
    if (clientes.length === 1 && paginaAtual > 0) {
      setPaginaAtual((p) => p - 1);
    } else {
      setVersao((v) => v + 1);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4ec] font-sans">
      <BarraDeNavegacaoLateral />

      <main className="ml-[152px] min-h-screen bg-[#f5f4ec]">
        <div className="max-w-[1300px] mx-auto px-6 py-7">

          {/* ── Cabeçalho */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">Gestão de Clientes</h1>
              <p className="text-sm text-gray-400 mt-1">Central de registros e histórico de pacientes premium.</p>
            </div>
          </div>

          {/* ── KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <CartaoKPIClientes
              rotulo="Total de Clientes"
              valor={carregando ? '—' : total.toLocaleString('pt-BR')}
              sub={carregando ? '' : `${total} cadastrados`}
              subIcone={iconeTendencia}
            />
            <CartaoKPIClientes
              rotulo="Clientes Ativos"
              valor={carregando ? '—' : ativos.toLocaleString('pt-BR')}
              sub="Engajamento alto"
              subIcone={iconeEnvolvimento}
            />
            <CartaoKPIClientes
              rotulo="Taxa de Retenção"
              valor={carregando ? '—' : `${retencao}%`}
              sub="Baseado nos cadastros"
              subIcone={iconeAlvo}
              destaque
            />
          </div>

          {/* ── Filtros */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-white border border-[#e8e6d9] rounded-lg px-3 py-2 flex-1 max-w-xs">
              <span className="text-gray-400 flex-shrink-0">{iconeBusca}</span>
              <input
                value={busca}
                onChange={(e) => handleBusca(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="text-sm text-gray-700 bg-transparent outline-none w-full placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setDropStatus(!dropStatus)}
                className="flex items-center gap-2 bg-white border border-[#e8e6d9] rounded-lg px-4 py-2 text-sm text-gray-600 font-medium hover:border-[#2C3E2D] transition-colors"
              >
                {filtroStatus} {iconeChevronBaixo}
              </button>
              {dropStatus && (
                <div className="absolute left-0 top-10 bg-white border border-[#e8e6d9] rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                  {statusOpcoes.map((o) => (
                    <button key={o} onClick={() => { setFiltroStatus(o); setDropStatus(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-[#f5f4ec]">{o}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── erro ── */}
          {erro && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
              {erro}
            </div>
          )}

          {/* ── Tabela ── */}
          <TabelaClientes
            clientes={clientes}
            carregando={carregando}
            onRemover={handleRemover}
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            tamanhoPagina={tamanhoPagina}
            aoMudarPagina={setPaginaAtual}
          />

        </div>
      </main>
    </div>
  );
}