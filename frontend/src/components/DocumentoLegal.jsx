import { Link } from "react-router-dom";
import "../assets/css/pages_css/legal.css";

function DocumentoLegal({
  documento,
  rotaRelacionada,
  textoRelacionada,
}) {
  return (
    <main className="legal-page">
      <article className="legal-document">
        <Link className="legal-back" to="/login">
          ← Voltar
        </Link>

        <header className="legal-header">
          <h1>{documento.titulo}</h1>
          <p>Última atualização: {documento.atualizadoEm}</p>
        </header>

        <nav className="legal-index" aria-label="Índice do documento">
          <h2>Neste documento</h2>
          <ol>
            {documento.secoes.map((secao) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`}>{secao.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal-sections">
          {documento.secoes.map((secao) => (
            <section
              key={secao.id}
              id={secao.id}
              aria-labelledby={`${secao.id}-titulo`}
              className="legal-section"
            >
              <h2 id={`${secao.id}-titulo`}>{secao.titulo}</h2>
              {secao.paragrafos.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
              {secao.itens && (
                <ul>
                  {secao.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <footer className="legal-footer">
          <Link to={rotaRelacionada}>{textoRelacionada}</Link>
        </footer>
      </article>
    </main>
  );
}

export default DocumentoLegal;
