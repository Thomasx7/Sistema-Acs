import unittest
from unittest.mock import patch

from sqlalchemy.exc import SQLAlchemyError

from app import create_app, db
from app.config import Config


class DeployTests(unittest.TestCase):
    def setUp(self):
        self.config_patch = patch.multiple(
            Config,
            PRODUCTION=False,
            UPLOAD_STORAGE="local",
            SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
            SECRET_KEY="s" * 64,
            JWT_SECRET_KEY="j" * 64,
            FRONTEND_URL="https://sistema-acs.vercel.app",
            CORS_ORIGINS=["https://sistema-acs.vercel.app"],
        )
        self.config_patch.start()
        self.addCleanup(self.config_patch.stop)
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_health_com_banco_acessivel(self):
        resposta = self.client.get("/health")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json, {"status": "ok"})

    def test_health_com_banco_indisponivel_nao_expoe_detalhes(self):
        with self.app.app_context(), patch.object(
            db.session, "execute", side_effect=SQLAlchemyError("detalhe interno")
        ):
            resposta = self.client.get("/health")
        self.assertEqual(resposta.status_code, 503)
        self.assertEqual(resposta.json, {"status": "indisponivel"})
        self.assertNotIn("detalhe interno", resposta.get_data(as_text=True))

    def test_preflight_permite_frontend_configurado(self):
        resposta = self.client.options("/auth/login", headers={
            "Origin": "https://sistema-acs.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Authorization,Content-Type",
        })
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(
            resposta.headers["Access-Control-Allow-Origin"],
            "https://sistema-acs.vercel.app",
        )
        self.assertIn("Authorization", resposta.headers["Access-Control-Allow-Headers"])

    def test_cors_nao_permite_outro_site(self):
        resposta = self.client.get("/health", headers={"Origin": "https://outro.example"})
        self.assertNotIn("Access-Control-Allow-Origin", resposta.headers)

    def test_autenticacao_continua_obrigatoria(self):
        self.assertEqual(self.client.get("/auth/me").status_code, 401)

    def test_producao_com_configuracao_valida(self):
        with patch.object(Config, "PRODUCTION", True):
            app = create_app()
        self.assertFalse(app.debug)

    def test_producao_rejeita_chave_ausente_ou_exemplo(self):
        for chave in (None, "chave-curta", "troque-por-uma-chave-aleatoria-de-exemplo"):
            with self.subTest(chave=chave), patch.object(Config, "PRODUCTION", True), patch.object(
                Config, "JWT_SECRET_KEY", chave
            ), self.assertRaisesRegex(RuntimeError, "JWT_SECRET_KEY"):
                create_app()

    def test_producao_rejeita_origens_inadequadas(self):
        for origem in (
            "http://localhost:5173", "https://sistema-acs.vercel.app/login",
            "https://*.vercel.app", "https://example.com?parametro=1",
        ):
            with self.subTest(origem=origem), patch.object(Config, "PRODUCTION", True), patch.object(
                Config, "CORS_ORIGINS", [origem]
            ), self.assertRaisesRegex(RuntimeError, "origens HTTPS"):
                create_app()


if __name__ == "__main__":
    unittest.main()
