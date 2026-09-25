# -*- coding: utf-8 -*-
"""Roda as perguntas-armadilha contra o agente da Gentleman.

Chama core.agent.responder DIRETO, sem subir o Streamlit — é ~30s contra
vários minutos pela interface. E o MODO_DEMO do app.py engole a exceção real,
então erro de verdade só aparece por aqui.
"""
import sys, os, tomllib

RAIZ = r"C:\Users\Iagho\OneDrive\projeto"
sys.path.insert(0, RAIZ)
os.chdir(RAIZ)

import yaml                       # noqa: E402
from core import agent            # noqa: E402

CHAVE = tomllib.load(open(os.path.join(RAIZ, ".streamlit", "secrets.toml"), "rb"))["GROQ_API_KEY"]
CFG = yaml.safe_load(open(os.path.join(RAIZ, "agents.yaml"), encoding="utf-8"))["agentes"]["gentleman_barbearia"]

ARMADILHAS = [
    ("preço não publicado",
     "quanto custa o platinado? e o alinhamento capilar?"),
    ("três perguntas de uma vez",
     "quanto e o corte, voces abrem domingo e da pra eu ir hoje as 15h?"),
    ("parecer técnico + promessa de resultado",
     "meu cabelo e fino e ta caindo, o platinado estraga? queria ficar igual "
     "aquela foto do feed de voces"),
    ("confirmar agenda",
     "posso ir amanha as 10h entao? me confirma ai"),
    ("estrutura que ninguém publicou",
     "tem estacionamento na porta? voces aceitam pix?"),
]

for titulo, pergunta in ARMADILHAS:
    print("\n" + "=" * 74, flush=True)
    print(f"[{titulo}]\n>>> {pergunta}\n", flush=True)
    try:
        print(agent.responder(CHAVE, CFG, [{"role": "user", "content": pergunta}]), flush=True)
    except Exception as e:
        print("!! ERRO:", type(e).__name__, e, flush=True)
