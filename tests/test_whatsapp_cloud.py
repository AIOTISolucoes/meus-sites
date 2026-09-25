import hashlib
import hmac
import os
import unittest
from unittest.mock import Mock, patch

from core import whatsapp_cloud


class WhatsAppCloudTest(unittest.TestCase):
    def test_valida_assinatura_sha256(self):
        corpo = b'{"object":"whatsapp_business_account"}'
        assinatura = "sha256=" + hmac.new(b"segredo", corpo, hashlib.sha256).hexdigest()
        with patch.dict(os.environ, {"WHATSAPP_APP_SECRET": "segredo"}):
            self.assertTrue(whatsapp_cloud.assinatura_valida(corpo, assinatura))
            self.assertFalse(whatsapp_cloud.assinatura_valida(corpo + b"x", assinatura))

    def test_extrai_texto_e_identidade_do_payload(self):
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{"changes": [{"field": "messages", "value": {
                "metadata": {"phone_number_id": "phone-1"},
                "contacts": [{"wa_id": "5585999999999", "profile": {"name": "Teste"}}],
                "messages": [{
                    "from": "5585999999999",
                    "id": "wamid.entrada",
                    "type": "text",
                    "text": {"body": "Quero um apartamento"},
                }],
            }}]}],
        }
        mensagens = whatsapp_cloud.extrair_mensagens(payload)
        self.assertEqual(len(mensagens), 1)
        self.assertEqual(mensagens[0]["de"], "5585999999999")
        self.assertEqual(mensagens[0]["nome"], "Teste")
        self.assertEqual(mensagens[0]["texto"], "Quero um apartamento")
        self.assertEqual(mensagens[0]["phone_number_id"], "phone-1")

    def test_extrai_status_de_falha_sem_dados_do_destinatario(self):
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{"changes": [{"field": "messages", "value": {
                "statuses": [{
                    "id": "wamid.saida",
                    "status": "failed",
                    "recipient_id": "5585999999999",
                    "errors": [{"code": 130497, "title": "Entrega bloqueada"}],
                }],
            }}]}],
        }
        statuses = whatsapp_cloud.extrair_statuses(payload)
        self.assertEqual(statuses, [{
            "id": "wamid.saida",
            "status": "failed",
            "erro_codigo": 130497,
            "erro_descricao": "Entrega bloqueada",
        }])

    def test_allowlist_aceita_variacao_brasileira_sem_nono_digito(self):
        with patch.dict(
            os.environ,
            {
                "WHATSAPP_TEST_RECIPIENTS": "5585991225077",
                "WHATSAPP_ALLOW_ALL": "false",
            },
        ):
            self.assertTrue(whatsapp_cloud.remetente_permitido("558591225077"))
            self.assertTrue(whatsapp_cloud.modo_teste("558591225077"))

    def test_envio_fica_bloqueado_quando_automacao_esta_desligada(self):
        with patch.dict(
            os.environ,
            {
                "WHATSAPP_ACCESS_TOKEN": "token",
                "WHATSAPP_PHONE_NUMBER_ID": "phone-1",
                "WHATSAPP_AUTOMATION_ENABLED": "false",
                "WHATSAPP_TEST_RECIPIENTS": "5585999999999",
            },
        ):
            with self.assertRaises(whatsapp_cloud.WhatsAppErro):
                whatsapp_cloud.enviar_texto("5585999999999", "Oi")

    @patch("core.whatsapp_cloud.requests.post")
    def test_envio_ativo_ainda_exige_numero_na_allowlist(self, post):
        resposta = Mock(ok=True)
        resposta.json.return_value = {"messages": [{"id": "wamid.saida"}]}
        post.return_value = resposta
        with patch.dict(
            os.environ,
            {
                "WHATSAPP_ACCESS_TOKEN": "token",
                "WHATSAPP_PHONE_NUMBER_ID": "phone-1",
                "WHATSAPP_AUTOMATION_ENABLED": "true",
                "WHATSAPP_TEST_RECIPIENTS": "5585999999999",
                "WHATSAPP_ALLOW_ALL": "false",
            },
        ):
            with self.assertRaises(whatsapp_cloud.WhatsAppErro):
                whatsapp_cloud.enviar_texto("5585888888888", "Oi")
            wamid = whatsapp_cloud.enviar_texto("+55 (85) 99999-9999", "Oi")
        self.assertEqual(wamid, "wamid.saida")
        post.assert_called_once()

    @patch("core.whatsapp_cloud._upload_imagem_jpeg", return_value="media-10")
    @patch("core.whatsapp_cloud._imagem_para_jpeg", return_value=b"jpeg")
    @patch("core.whatsapp_cloud.requests.post")
    def test_envia_imagem_publica_com_legenda(self, post, converter, upload):
        resposta = Mock(ok=True)
        resposta.json.return_value = {"messages": [{"id": "wamid.imagem"}]}
        post.return_value = resposta
        with patch.dict(
            os.environ,
            {
                "WHATSAPP_ACCESS_TOKEN": "token",
                "WHATSAPP_PHONE_NUMBER_ID": "phone-1",
                "WHATSAPP_AUTOMATION_ENABLED": "true",
                "WHATSAPP_TEST_RECIPIENTS": "5585999999999",
                "WHATSAPP_ALLOW_ALL": "false",
            },
        ):
            wamid = whatsapp_cloud.enviar_imagem(
                "5585999999999",
                "https://cdn.test/capa.webp",
                "Cód. 10",
            )

        self.assertEqual(wamid, "wamid.imagem")
        payload = post.call_args.kwargs["json"]
        self.assertEqual(payload["type"], "image")
        self.assertEqual(payload["image"]["id"], "media-10")
        self.assertEqual(payload["image"]["caption"], "Cód. 10")
        converter.assert_called_once_with("https://cdn.test/capa.webp")
        upload.assert_called_once_with(b"jpeg")


if __name__ == "__main__":
    unittest.main()
