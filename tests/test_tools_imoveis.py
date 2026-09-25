import os
import unittest
from unittest.mock import Mock, patch

from core import tools


class BuscarImoveisTest(unittest.TestCase):
    def resposta(self, dados):
        resposta = Mock()
        resposta.raise_for_status.return_value = None
        resposta.json.return_value = dados
        return resposta

    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://catalogo.test", "SUPABASE_ANON_KEY": "anon"},
        clear=False,
    )
    @patch("core.tools.requests.post")
    def test_busca_varios_bairros_e_remove_duplicados(self, post):
        comum = {
            "codigo": 14,
            "titulo": "Casa duplex",
            "bairro": "Urucunema",
            "cidade": "Eusébio",
            "preco": 464900,
        }
        outro = {
            "codigo": 20,
            "titulo": "Apartamento",
            "bairro": "Meireles",
            "cidade": "Fortaleza",
            "preco": 620000,
        }
        post.side_effect = [
            self.resposta([comum]),
            self.resposta([comum, outro]),
        ]

        resultado = tools.buscar_imoveis(
            finalidade="venda",
            tipo="apartamento",
            bairro=["Aldeota", "Meireles"],
            preco_max=650000,
        )

        self.assertEqual(post.call_count, 2)
        self.assertEqual(post.call_args_list[0].kwargs["json"]["p_bairro"], "Aldeota")
        self.assertEqual(post.call_args_list[1].kwargs["json"]["p_bairro"], "Meireles")
        self.assertEqual(resultado.count("Cód 14"), 1)
        self.assertIn("Cód 20", resultado)

    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://catalogo.test", "SUPABASE_ANON_KEY": "anon"},
        clear=False,
    )
    @patch("core.tools.requests.post")
    def test_bairro_nulo_mantem_busca_ampla(self, post):
        post.return_value = self.resposta([])

        resultado = tools.buscar_imoveis(bairro=None)

        self.assertEqual(post.call_count, 1)
        self.assertNotIn("p_bairro", post.call_args.kwargs["json"])
        self.assertIn("Nenhum imóvel", resultado)

    def test_extrai_codigos_sem_duplicar(self):
        self.assertEqual(
            tools.codigos_de_imoveis(
                "Tenho o cód. 10, o código 7 e também o CÓD 10."
            ),
            [10, 7],
        )

    @patch.dict(
        os.environ,
        {
            "SUPABASE_URL": "https://catalogo.test",
            "SUPABASE_ANON_KEY": "anon",
            "SITE_PUBLIC_URL": "https://imoveis.test",
        },
        clear=False,
    )
    @patch("core.tools.requests.get")
    def test_cartoes_preservam_ordem_e_criam_link(self, get):
        get.return_value = self.resposta([
            {"codigo": 7, "titulo": "Sete", "capa": "https://img/7.webp"},
            {"codigo": 10, "titulo": "Dez", "capa": "https://img/10.webp"},
        ])

        cartoes = tools.cartoes_imoveis([10, 7])

        self.assertEqual([item["codigo"] for item in cartoes], [10, 7])
        self.assertEqual(
            cartoes[0]["link"],
            "https://imoveis.test/imovel.html?cod=10",
        )


if __name__ == "__main__":
    unittest.main()
