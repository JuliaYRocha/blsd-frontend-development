import api from "./api";
import { normalizarPagina } from "../utils/paginacao";

async function buscarPaginaClientes(rota, { page, size, busca, sort }) {
  const termo = (busca || '').trim().toLowerCase();

  if (termo) {
    const { data } = await api.get(rota, { params: { page: 0, size: 1000, sort } });
    const filtrados = (data?.content ?? []).filter(
      (c) => c.nome?.toLowerCase().includes(termo) || c.email?.toLowerCase().includes(termo)
    );
    const totalElements = filtrados.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const number = Math.min(Math.max(0, page), totalPages - 1);
    return {
      content: filtrados.slice(number * size, number * size + size),
      totalElements,
      totalPages,
      number,
      size,
    };
  }

  const { data } = await api.get(rota, { params: { page, size, sort } });
  return normalizarPagina(data, { page, size });
}

export function listarClientes({ page = 0, size = 10, busca = '', sort = 'nome,asc' } = {}) {
  return buscarPaginaClientes('/cliente', { page, size, busca, sort });
}

export function listarClientesGestor({ page = 0, size = 10, busca = '', sort = 'nome,asc' } = {}) {
  return buscarPaginaClientes('/usuarios/clientes', { page, size, busca, sort });
}

export async function deletarCliente(id) {
  await api.delete(`/cliente/${id}`);
}

export async function atualizarCliente(id, dados) {
  const { data } = await api.put(
    `/cliente/${id}`,
    {
      nome: dados.nome,
      email: dados.email,
      dataNasc: dados.dataNasc,
      telefone: dados.telefone,
      urlFoto: dados.urlFoto || '',
    }
  );
  return data;
}

export async function listarCliente(id) {
  const { data } = await api.get(`/cliente/${id}`);
  return data; // [{ id, nome, email, telefone, urlFoto, dataCriacao, dataNasc, acesso, senha }]
}

export async function atualizarFotoCliente(id, arquivoFoto) {
  const formData = new FormData();
  formData.append("file", arquivoFoto);

  const { data } = await api.patch(`/cliente/${id}/foto`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}
