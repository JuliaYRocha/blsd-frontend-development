export function normalizarPagina(data, { page = 0, size = 10 } = {}) {
  const meta = data?.page ?? data ?? {};
  const content = Array.isArray(data?.content) ? data.content : [];
  return {
    content,
    totalElements: Number(meta.totalElements ?? content.length),
    totalPages: Math.max(1, Number(meta.totalPages ?? 1)),
    number: Number(meta.number ?? page),
    size: Number(meta.size ?? size),
  };
}
