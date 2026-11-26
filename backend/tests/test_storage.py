import hashlib
from io import BytesIO
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

from botocore.exceptions import ClientError, EndpointConnectionError
from botocore.response import StreamingBody
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import SQLAlchemyError

from app import create_app, db
from app.config import Config
from app.models.models import LibraryCategory, LibraryMaterial, Usuarios
from app.services.object_storage import StorageError, validar_chave


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.objetos = {}
        self.s3 = Mock()
        self.s3.upload_fileobj.side_effect = self.upload
        self.s3.get_object.side_effect = self.download
        self.s3.delete_object.side_effect = self.delete
        patches = [
            patch.multiple(
                Config, PRODUCTION=False, UPLOAD_STORAGE="s3",
                SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
                SECRET_KEY="s" * 64, JWT_SECRET_KEY="j" * 64,
                AWS_ENDPOINT_URL_S3="https://storage.example.com",
                AWS_REGION="us-east-1", AWS_ACCESS_KEY_ID="test-key",
                AWS_SECRET_ACCESS_KEY="test-secret", S3_BUCKET="test-bucket",
            ),
            patch("app.services.object_storage.boto3.client", return_value=self.s3),
        ]
        for item in patches:
            item.start()
            self.addCleanup(item.stop)
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            db.session.add_all([
                Usuarios(id_usuario=1, nome="Administrador", email="adm@example.com",
                         senha="hash-teste", permissao="ADM", status="Ativo"),
                Usuarios(id_usuario=2, nome="Comum", email="comum@example.com",
                         senha="hash-teste", permissao="Comum", status="Ativo"),
                LibraryCategory(id=1, name="Estudo", slug="estudo"),
            ])
            db.session.commit()
            self.adm = {"Authorization": f"Bearer {create_access_token(identity='1')}"}
            self.comum = {"Authorization": f"Bearer {create_access_token(identity='2')}"}

    def upload(self, stream, bucket, key, ExtraArgs):
        self.objetos[key] = (stream.read(), ExtraArgs["ContentType"])

    def download(self, Bucket, Key):
        if Key not in self.objetos:
            raise ClientError({"Error": {"Code": "NoSuchKey"}}, "GetObject")
        conteudo, mime = self.objetos[Key]
        return {
            "Body": StreamingBody(BytesIO(conteudo), len(conteudo)),
            "ContentLength": len(conteudo), "ContentType": mime,
        }

    def delete(self, Bucket, Key):
        self.objetos.pop(Key, None)
        return {}

    def criar_material(self, headers=None):
        return self.client.post("/library/materials", headers=headers or self.adm, data={
            "category_id": "1", "title": "Material", "type": "PDF",
            "file": (BytesIO(b"%PDF-1.4\nconteudo"), "estudo.pdf"),
        })

    def test_material_envio_download_autenticado_e_exclusao(self):
        criado = self.criar_material()
        self.assertEqual(criado.status_code, 201)
        self.assertNotIn("file_path", criado.json)
        material_id = criado.json["id"]
        chave = next(iter(self.objetos))
        self.assertRegex(chave, r"^library/1/[a-f0-9]{32}\.pdf$")
        self.assertEqual(self.client.get(f"/library/materials/{material_id}/download").status_code, 401)
        self.s3.get_object.assert_not_called()
        resposta = self.client.get(f"/library/materials/{material_id}/download", headers=self.comum)
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.data, b"%PDF-1.4\nconteudo")
        self.assertIn("attachment", resposta.headers["Content-Disposition"])
        resposta.close()
        with self.app.app_context():
            material = db.session.get(LibraryMaterial, material_id)
            self.assertEqual(material.checksum, hashlib.sha256(b"%PDF-1.4\nconteudo").hexdigest())
        self.assertEqual(self.client.delete(f"/library/materials/{material_id}", headers=self.adm).status_code, 200)
        self.assertFalse(self.objetos)

    def test_usuario_comum_nao_envia_material(self):
        self.assertEqual(self.criar_material(self.comum).status_code, 403)
        self.s3.upload_fileobj.assert_not_called()

    def test_foto_envio_leitura_e_exclusao(self):
        png = b"\x89PNG\r\n\x1a\nconteudo"
        resposta = self.client.post("/usuarios/foto-perfil", headers=self.comum, data={
            "foto": (BytesIO(png), "foto.png"),
        })
        self.assertEqual(resposta.status_code, 200)
        caminho = resposta.json["usuario"]["foto_perfil"]
        self.assertRegex(caminho, r"^uploads/perfil/[a-f0-9]{32}\.png$")
        resposta = self.client.get(f"/{caminho}")
        self.assertEqual(resposta.data, png)
        self.assertEqual(resposta.mimetype, "image/png")
        resposta.close()
        self.assertEqual(self.client.delete("/usuarios/foto-perfil", headers=self.comum).status_code, 200)
        self.assertNotIn(caminho, self.objetos)

    def test_foto_invalida_nao_chega_ao_bucket(self):
        resposta = self.client.post("/usuarios/foto-perfil", headers=self.comum, data={
            "foto": (BytesIO(b"nao e imagem"), "foto.png"),
        })
        self.assertEqual(resposta.status_code, 400)
        self.s3.upload_fileobj.assert_not_called()

    def test_falha_no_commit_da_foto_preserva_foto_anterior(self):
        def dados():
            return {"foto": (BytesIO(b"\x89PNG\r\n\x1a\nconteudo"), "foto.png")}
        resposta = self.client.post("/usuarios/foto-perfil", headers=self.comum, data=dados())
        anterior = resposta.json["usuario"]["foto_perfil"]
        with patch.object(db.session, "commit", side_effect=SQLAlchemyError("falha simulada")):
            resposta = self.client.post("/usuarios/foto-perfil", headers=self.comum, data=dados())
        self.assertEqual(resposta.status_code, 500)
        self.assertEqual(list(self.objetos), [anterior])
        with self.app.app_context():
            self.assertEqual(db.session.get(Usuarios, 2).foto_perfil, anterior)

    def test_armazenamento_local_de_fotos_continua_disponivel(self):
        from app.utils.foto_perfil import excluir_foto_perfil, gravar_foto_perfil

        with tempfile.TemporaryDirectory() as pasta, self.app.app_context():
            self.app.config["UPLOAD_STORAGE"] = "local"
            raiz = Path(pasta)
            with patch("app.utils.foto_perfil.BACKEND_DIR", raiz), patch(
                "app.utils.foto_perfil.PASTA_FOTOS_PERFIL", raiz / "uploads" / "perfil"
            ):
                caminho = f"uploads/perfil/{'a' * 32}.png"
                gravar_foto_perfil(caminho, b"imagem", "png")
                self.assertEqual((raiz / caminho).read_bytes(), b"imagem")
                excluir_foto_perfil(caminho)
                self.assertFalse((raiz / caminho).exists())
        self.s3.upload_fileobj.assert_not_called()

    def test_troca_de_material_com_falha_no_commit_preserva_arquivo_antigo(self):
        material_id = self.criar_material().json["id"]
        chave_antiga = next(iter(self.objetos))
        with patch.object(db.session, "commit", side_effect=SQLAlchemyError("falha simulada")):
            resposta = self.client.patch(f"/library/materials/{material_id}", headers=self.adm, data={
                "file": (BytesIO(b"%PDF-1.4\nnovo"), "novo.pdf"),
            })
        self.assertEqual(resposta.status_code, 500)
        self.assertEqual(list(self.objetos), [chave_antiga])
        with self.app.app_context():
            self.assertEqual(db.session.get(LibraryMaterial, material_id).file_path, chave_antiga.removeprefix("library/"))

    def test_troca_por_link_so_remove_arquivo_depois_do_commit(self):
        material_id = self.criar_material().json["id"]
        chave = next(iter(self.objetos))
        dados = {"type": "LINK", "url": "https://example.com/material"}
        with patch.object(db.session, "commit", side_effect=SQLAlchemyError("falha simulada")):
            resposta = self.client.patch(f"/library/materials/{material_id}", headers=self.adm, json=dados)
        self.assertEqual(resposta.status_code, 500)
        self.assertIn(chave, self.objetos)
        resposta = self.client.patch(f"/library/materials/{material_id}", headers=self.adm, json=dados)
        self.assertEqual(resposta.status_code, 200)
        self.assertNotIn(chave, self.objetos)

    def test_s3_indisponivel_nao_expoe_resposta_do_provedor(self):
        material_id = self.criar_material().json["id"]
        self.s3.get_object.side_effect = ClientError({
            "Error": {"Code": "AccessDenied", "Message": "detalhe privado do provedor"},
        }, "GetObject")
        resposta = self.client.get(f"/library/materials/{material_id}/download", headers=self.comum)
        self.assertEqual(resposta.status_code, 503)
        self.assertNotIn("privado", resposta.get_data(as_text=True))

    def test_falha_no_envio_nao_cria_material_no_banco(self):
        self.s3.upload_fileobj.side_effect = EndpointConnectionError(endpoint_url="https://storage.example.com")
        resposta = self.criar_material()
        self.assertEqual(resposta.status_code, 503)
        with self.app.app_context():
            self.assertEqual(db.session.query(LibraryMaterial).count(), 0)

    def test_objeto_ausente_retorna_404(self):
        material_id = self.criar_material().json["id"]
        self.objetos.clear()
        resposta = self.client.get(f"/library/materials/{material_id}/download", headers=self.comum)
        self.assertEqual(resposta.status_code, 404)

    def test_travessia_de_diretorios_nao_chega_ao_s3(self):
        for chave in ("../arquivo", "/library/a", "library/../a", "library//a", "uploads\\perfil\\a"):
            with self.subTest(chave=chave), self.assertRaises(StorageError):
                validar_chave(chave)
        self.assertEqual(self.client.get("/uploads/perfil/invalido.png").status_code, 404)
        self.s3.get_object.assert_not_called()

    def test_configuracao_s3_incompleta_impede_inicializacao(self):
        with patch.object(Config, "AWS_SECRET_ACCESS_KEY", ""), self.assertRaisesRegex(RuntimeError, "AWS_SECRET_ACCESS_KEY"):
            create_app()
        with patch.object(Config, "AWS_ENDPOINT_URL_S3", "https\\://invalido"), self.assertRaisesRegex(RuntimeError, "endpoint HTTPS"):
            create_app()

    def test_armazenamento_local_continua_disponivel(self):
        with tempfile.TemporaryDirectory() as pasta:
            self.app.config.update(UPLOAD_STORAGE="local", LIBRARY_UPLOAD_DIR=pasta)
            criado = self.criar_material()
            self.assertEqual(criado.status_code, 201)
            self.assertEqual(len(list(Path(pasta).rglob("*.pdf"))), 1)
            resposta = self.client.get(f"/library/materials/{criado.json['id']}/download", headers=self.comum)
            self.assertEqual(resposta.data, b"%PDF-1.4\nconteudo")
            resposta.close()
            self.assertEqual(self.client.delete(f"/library/materials/{criado.json['id']}", headers=self.adm).status_code, 200)
            self.assertFalse(list(Path(pasta).rglob("*.pdf")))
        self.s3.upload_fileobj.assert_not_called()


if __name__ == "__main__":
    unittest.main()
