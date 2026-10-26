import DocumentoLegal from "../../components/DocumentoLegal";
import { politicaPrivacidade } from "../../data/documentosLegais";

function Privacidade() {
  return (
    <DocumentoLegal
      documento={politicaPrivacidade}
      rotaRelacionada="/termos"
      textoRelacionada="Leia também os Termos de Uso"
    />
  );
}

export default Privacidade;
