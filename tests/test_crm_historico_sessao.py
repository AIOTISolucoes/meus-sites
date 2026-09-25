import unittest
from unittest.mock import patch

from core import crm


class HistoricoSessaoTest(unittest.TestCase):
    @patch("core.crm._rest")
    def test_marcador_separa_sessao_sem_apagar_historico(self, rest):
        rest.return_value = [
            {
                "tipo": "mensagem",
                "direcao": "entrada",
                "conteudo": "Quero ver as opções atuais",
                "criado_em": "2026-09-23T01:05:00+00:00",
            },
            {
                "tipo": "nota",
                "direcao": "interna",
                "conteudo": crm._MARCADOR_NOVA_SESSAO,
                "criado_em": "2026-09-23T01:04:00+00:00",
            },
            {
                "tipo": "mensagem",
                "direcao": "entrada",
                "conteudo": "Apartamento no Eusébio com 3 quartos",
                "criado_em": "2026-09-23T01:03:00+00:00",
            },
        ]

        self.assertEqual(
            crm.historico_do_lead("lead-1"),
            [{"role": "user", "content": "Quero ver as opções atuais"}],
        )

    @patch("core.crm._rest")
    def test_descarta_conversa_antiga_apos_24_horas(self, rest):
        rest.return_value = [
            {
                "direcao": "entrada",
                "autor": "cliente",
                "conteudo": "Quero conhecer os imóveis",
                "criado_em": "2026-09-23T01:00:00+00:00",
            },
            {
                "direcao": "saida",
                "autor": "ia",
                "conteudo": "Qual é o seu nome?",
                "criado_em": "2026-09-05T13:00:01+00:00",
            },
            {
                "direcao": "entrada",
                "autor": "cliente",
                "conteudo": "Apartamento no Eusébio com 3 quartos",
                "criado_em": "2026-09-05T13:00:00+00:00",
            },
        ]

        self.assertEqual(
            crm.historico_do_lead("lead-1"),
            [{"role": "user", "content": "Quero conhecer os imóveis"}],
        )

    @patch("core.crm._rest")
    def test_preserva_trocas_da_sessao_atual(self, rest):
        rest.return_value = [
            {
                "direcao": "entrada",
                "conteudo": "Compra",
                "criado_em": "2026-09-23T01:02:00+00:00",
            },
            {
                "direcao": "saida",
                "conteudo": "É para compra ou aluguel?",
                "criado_em": "2026-09-23T01:01:00+00:00",
            },
            {
                "direcao": "entrada",
                "conteudo": "Quero conhecer os imóveis",
                "criado_em": "2026-09-23T01:00:00+00:00",
            },
        ]

        self.assertEqual(
            crm.historico_do_lead("lead-1"),
            [
                {"role": "user", "content": "Quero conhecer os imóveis"},
                {"role": "assistant", "content": "É para compra ou aluguel?"},
                {"role": "user", "content": "Compra"},
            ],
        )


if __name__ == "__main__":
    unittest.main()
