import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock

from core import agent


class LimpezaRespostaTest(unittest.TestCase):
    def test_oculta_raciocinio_do_gpt_oss_na_api(self):
        client = MagicMock()
        client.chat.completions.create.return_value = SimpleNamespace(usage=None)

        agent._chamar(
            client,
            ["openai/gpt-oss-120b"],
            0,
            [],
            [],
            {"temperatura": 0.2},
            "teste",
        )

        self.assertEqual(
            client.chat.completions.create.call_args.kwargs["reasoning_format"],
            "hidden",
        )

    def test_remove_prefixo_interno_de_continuacao(self):
        texto = (
            "Nen **...** (continuação)No momento temos opções em outras regiões."
        )
        self.assertEqual(
            agent._limpar(texto),
            "No momento temos opções em outras regiões.",
        )

    def test_preserva_resposta_normal(self):
        texto = "Tenho três opções disponíveis. Quer que eu mostre?"
        self.assertEqual(agent._limpar(texto), texto)


if __name__ == "__main__":
    unittest.main()
