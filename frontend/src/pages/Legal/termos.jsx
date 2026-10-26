import DocumentoLegal from "../../components/DocumentoLegal";
import { termosDeUso } from "../../data/documentosLegais";

function Termos() {
  return (
    <DocumentoLegal
      documento={termosDeUso}
      rotaRelacionada="/privacidade"
      textoRelacionada="Leia também a Política de Privacidade"
    />
  );
}

export default Termos;
