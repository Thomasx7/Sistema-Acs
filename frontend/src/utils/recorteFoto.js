export function calcularRecorteFoto(largura, altura, zoom, horizontal, vertical) {
    const tamanho = Math.min(largura, altura) / zoom;
    return {
        x: (largura - tamanho) * horizontal / 100,
        y: (altura - tamanho) * vertical / 100,
        tamanho,
    };
}

export async function gerarFotoRecortada(imagem, recorte) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const contexto = canvas.getContext("2d");
    if (!contexto) throw new Error("Não foi possível preparar o recorte.");
    contexto.drawImage(imagem, recorte.x, recorte.y, recorte.tamanho, recorte.tamanho, 0, 0, 512, 512);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Não foi possível gerar a foto. Tente novamente.");
    return new File([blob], "foto-perfil.png", { type: "image/png" });
}
