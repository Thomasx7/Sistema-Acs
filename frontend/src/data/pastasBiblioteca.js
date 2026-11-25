export const PALETA_CATEGORIA = {
    "card-cor-1": { nome: "Azul", cor: "var(--azul-secundario)" },
    "card-azul-claro": { nome: "Azul royal", cor: "var(--azul-claro)" },
    "card-azul-marinho": { nome: "Azul marinho", cor: "var(--azul)" },
    "card-amarelo": { nome: "Amarelo", cor: "var(--aviso-fundo)", texto: "var(--texto)", intensidade: "95%" },
    "card-cor-6": { nome: "Amarelo oliva", cor: "var(--cor-paleta-6)" },
    "card-seguranca": { nome: "Laranja", cor: "var(--cor-seguranca)" },
    "card-cor-4": { nome: "Terracota", cor: "var(--cor-paleta-4)" },
    "card-letramento": { nome: "Verde", cor: "var(--sucesso)" },
    "card-cor-2": { nome: "Verde folha", cor: "var(--cor-paleta-2)" },
    "card-verde-agua": { nome: "Verde água", cor: "var(--cor-letramento)" },
    "card-cor-5": { nome: "Verde petróleo", cor: "var(--cor-paleta-5)" },
    "card-saude": { nome: "Rosa", cor: "var(--cor-saude)" },
    "card-cor-3": { nome: "Malva", cor: "var(--cor-paleta-3)" },
};

export const ICONES_CATEGORIA = {
    audio: { nome: "Microfone", tipo: "Áudios e podcasts", padrao: /podcast|audio|microfone/,
        caminho: "M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3Zm-6-4v1a6 6 0 0 0 12 0v-1M12 18v4m-4 0h8" },
    video: { nome: "YouTube", tipo: "Vídeos", padrao: /youtube|video|player/,
        caminho: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm6 3 6 4-6 4V8Z" },
    file: { nome: "Documento", tipo: "Documentos", padrao: /document|pdf|word|arquivo|file/,
        caminho: "M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8m-8 4h6" },
    chart: { nome: "Gráfico", tipo: "Infográficos", padrao: /infograf|grafico|chart/,
        caminho: "M4 3v18h17M8 16v-5m5 5V6m5 10v-7" },
    spreadsheet: { nome: "Planilha", tipo: "Planilhas", padrao: /planilha|excel|tabela|spreadsheet/,
        caminho: "M3 4h18v16H3V4Zm0 5h18M3 14h18M9 9v11m6-11v11" },
    image: { nome: "Imagem", tipo: "Imagens e infográficos", padrao: /imagem|foto|image|picture/,
        caminho: "M4 3h16v18H4V3Zm0 14 5-5 4 4 3-3 4 4M15 8h.01" },
    book: { nome: "Livro", tipo: "Guias e manuais", padrao: /guia|manual|livro|book/,
        caminho: "M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15" },
    link: { nome: "Link", tipo: "Links e recursos externos", padrao: /link|elo|corrente/,
        caminho: "m10 14 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" },
    presentation: { nome: "Apresentação", tipo: "Apresentações", padrao: /apresenta|slide|powerpoint/,
        caminho: "M3 3h18v13H3V3Zm9 13v6m-5 0 5-6 5 6M7 11V8m5 3V6m5 5V9" },
    headphones: { nome: "Fones", tipo: "Áudios", padrao: /fone|headphone/,
        caminho: "M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v8H3v-8Zm14 0h4v8h-4v-8Z" },
    health: { nome: "Saúde", tipo: "Conteúdos de saúde", padrao: /saude|health/,
        caminho: "M12 21 3 12a5 5 0 0 1 9-6 5 5 0 0 1 9 6l-9 9ZM5 12h4l2-4 2 8 2-4h4" },
    folder: { nome: "Pasta", tipo: "Materiais diversos", padrao: /pasta|folder/,
        caminho: "M3 7V4h7l3 3h8v13H3V7Z" },
};

export function configurarPasta(categoria) {
    const cor = categoria.color === "card-lgpd" ? "card-cor-1" : categoria.color;
    const normalizar = (valor) => (valor || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    const opcoes = Object.values(ICONES_CATEGORIA);
    // A escolha salva prevalece sobre a sugestão pelo nome da categoria.
    const icone = ICONES_CATEGORIA[categoria.icon]
        || opcoes.find(({ padrao }) => padrao.test(normalizar(categoria.icon)))
        || opcoes.find(({ padrao }) => padrao.test(normalizar(`${categoria.name || ""} ${categoria.slug || ""}`)))
        || ICONES_CATEGORIA.folder;
    return {
        cor: (PALETA_CATEGORIA[cor] || PALETA_CATEGORIA["card-cor-1"]).cor,
        texto: PALETA_CATEGORIA[cor]?.texto,
        intensidade: PALETA_CATEGORIA[cor]?.intensidade,
        icone: icone.caminho,
        tipo: icone.tipo,
    };
}

export function contarMateriais(quantidade) {
    return `${quantidade} ${quantidade === 1 ? "material" : "materiais"}`;
}
