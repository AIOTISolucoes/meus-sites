"""Reproduz, sem WhatsApp nem persistencia, as falhas vistas no teste real."""

import os

from core import agent, config, tools


def responder(historico):
    agentes = config.carregar_agentes()
    return agent.responder(
        os.environ["GROQ_API_KEY"],
        dict(agentes["ah_imobiliaria"]),
        historico,
    )


CASOS = {
    "abertura_generica": [
        {"role": "user", "content": "Oi, quero conhecer os imóveis"},
    ],
    "pedir_alternativas": [
        {"role": "user", "content": "Meu nome é Max e quero comprar até 300 mil"},
        {
            "role": "assistant",
            "content": "Não encontrei imóvel até R$ 300 mil agora. Quer ser avisado?",
        },
        {"role": "user", "content": "Me sugira quais tem então"},
    ],
    "remover_preco": [
        {"role": "user", "content": "Quero comprar um apartamento até 300 mil"},
        {
            "role": "assistant",
            "content": "Não encontrei apartamento até R$ 300 mil agora. Quer ser avisado?",
        },
        {
            "role": "user",
            "content": "Não precisa ser de 300 mil, pode ser de qualquer preço",
        },
    ],
}


if __name__ == "__main__":
    print("[catalogo_amplo]")
    print(tools.buscar_imoveis(finalidade="venda"))
    print("\n[catalogo_apartamentos]")
    print(tools.buscar_imoveis(finalidade="venda", tipo="apartamento"))
    for nome, historico in CASOS.items():
        print(f"\n[{nome}]")
        print(responder(historico))
