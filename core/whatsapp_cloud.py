"""Adaptador seguro da WhatsApp Cloud API.

Nenhum envio acontece apenas porque as credenciais existem. Para enviar é
necessário ativar WHATSAPP_AUTOMATION_ENABLED e autorizar explicitamente o
destinatário em WHATSAPP_TEST_RECIPIENTS, ou ligar WHATSAPP_ALLOW_ALL somente
depois da homologação.
"""

from __future__ import annotations

import hashlib
import hmac
import os
from io import BytesIO
from typing import Any
from urllib.parse import urlparse

import requests


class WhatsAppErro(RuntimeError):
    """Falha segura na configuração, validação ou chamada da Cloud API."""


def _verdadeiro(nome: str) -> bool:
    return os.environ.get(nome, "").strip().lower() in {"1", "true", "sim", "yes", "on"}


def _lista(nome: str) -> set[str]:
    numeros: set[str] = set()
    for item in os.environ.get(nome, "").split(","):
        numero = "".join(c for c in item if c.isdigit())
        numeros.update(_variantes_numero(numero))
    return numeros


def _variantes_numero(numero: str) -> set[str]:
    """Normaliza a variacao brasileira com/sem o nono digito no wa_id."""
    digitos = "".join(c for c in str(numero) if c.isdigit())
    if not digitos:
        return set()
    variantes = {digitos}
    if digitos.startswith("55"):
        if len(digitos) == 13 and digitos[4] == "9":
            variantes.add(digitos[:4] + digitos[5:])
        elif len(digitos) == 12:
            variantes.add(digitos[:4] + "9" + digitos[4:])
    return variantes


def configurado() -> bool:
    return bool(
        os.environ.get("WHATSAPP_ACCESS_TOKEN", "").strip()
        and os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    )


def ativo() -> bool:
    return configurado() and _verdadeiro("WHATSAPP_AUTOMATION_ENABLED")


def remetente_permitido(wa_id: str) -> bool:
    numero = "".join(c for c in str(wa_id) if c.isdigit())
    return bool(numero) and (
        bool(_variantes_numero(numero) & _lista("WHATSAPP_TEST_RECIPIENTS"))
        or _verdadeiro("WHATSAPP_ALLOW_ALL")
    )


def modo_teste(wa_id: str) -> bool:
    """Indica que o numero esta na allowlist e o atendimento geral segue fechado."""
    numero = "".join(c for c in str(wa_id) if c.isdigit())
    return (
        bool(numero)
        and bool(_variantes_numero(numero) & _lista("WHATSAPP_TEST_RECIPIENTS"))
        and not _verdadeiro("WHATSAPP_ALLOW_ALL")
    )


def assinatura_valida(corpo: bytes, assinatura: str) -> bool:
    segredo = (
        os.environ.get("WHATSAPP_APP_SECRET", "").strip()
        or os.environ.get("META_APP_SECRET", "").strip()
    )
    if not segredo or not assinatura.startswith("sha256="):
        return False
    esperada = "sha256=" + hmac.new(segredo.encode(), corpo, hashlib.sha256).hexdigest()
    return hmac.compare_digest(assinatura, esperada)


def extrair_mensagens(payload: dict[str, Any]) -> list[dict[str, str]]:
    if payload.get("object") != "whatsapp_business_account":
        return []
    resultado = []
    for entrada in payload.get("entry", []):
        if not isinstance(entrada, dict):
            continue
        for mudanca in entrada.get("changes", []):
            if not isinstance(mudanca, dict) or mudanca.get("field") != "messages":
                continue
            valor = mudanca.get("value") or {}
            metadata = valor.get("metadata") or {}
            contatos = {
                str(item.get("wa_id")): str((item.get("profile") or {}).get("name") or "").strip()
                for item in valor.get("contacts", [])
                if isinstance(item, dict) and item.get("wa_id")
            }
            for mensagem in valor.get("messages", []):
                if not isinstance(mensagem, dict):
                    continue
                tipo = mensagem.get("type")
                texto = ""
                if tipo == "text":
                    texto = str((mensagem.get("text") or {}).get("body") or "").strip()
                elif tipo == "button":
                    texto = str((mensagem.get("button") or {}).get("text") or "").strip()
                elif tipo == "interactive":
                    interativo = mensagem.get("interactive") or {}
                    resposta = interativo.get("button_reply") or interativo.get("list_reply") or {}
                    texto = str(resposta.get("title") or resposta.get("id") or "").strip()
                remetente = "".join(c for c in str(mensagem.get("from") or "") if c.isdigit())
                identificador = str(mensagem.get("id") or "").strip()
                if remetente and identificador:
                    resultado.append(
                        {
                            "id": identificador,
                            "de": remetente,
                            "nome": contatos.get(remetente, ""),
                            "texto": texto,
                            "tipo": str(tipo or "unknown"),
                            "phone_number_id": str(metadata.get("phone_number_id") or ""),
                        }
                    )
    return resultado


def extrair_statuses(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """Extrai confirmacoes de envio sem guardar destinatario ou payload bruto."""
    if payload.get("object") != "whatsapp_business_account":
        return []
    resultado: list[dict[str, Any]] = []
    for entrada in payload.get("entry", []):
        if not isinstance(entrada, dict):
            continue
        for mudanca in entrada.get("changes", []):
            if not isinstance(mudanca, dict) or mudanca.get("field") != "messages":
                continue
            valor = mudanca.get("value") or {}
            for item in valor.get("statuses", []):
                if not isinstance(item, dict):
                    continue
                identificador = str(item.get("id") or "").strip()
                status = str(item.get("status") or "").strip().lower()
                if not identificador or status not in {"sent", "delivered", "read", "failed"}:
                    continue
                erros = item.get("errors") or []
                erro = erros[0] if erros and isinstance(erros[0], dict) else {}
                resultado.append(
                    {
                        "id": identificador,
                        "status": status,
                        "erro_codigo": erro.get("code"),
                        "erro_descricao": str(
                            erro.get("title") or erro.get("message") or ""
                        ).strip()[:500],
                    }
                )
    return resultado


def _enviar_payload(destinatario: str, conteudo: dict[str, Any]) -> str:
    numero = _validar_destinatario(destinatario)
    token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "").strip()
    phone_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    versao = os.environ.get(
        "WHATSAPP_GRAPH_API_VERSION",
        os.environ.get("META_GRAPH_API_VERSION", "v26.0"),
    ).strip()
    try:
        resposta = requests.post(
            f"https://graph.facebook.com/{versao}/{phone_id}/messages",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": numero,
                **conteudo,
            },
            timeout=20,
        )
    except requests.RequestException as erro:
        raise WhatsAppErro("A Cloud API nao respondeu a tempo.") from erro
    return _id_confirmado(resposta)


def _validar_destinatario(destinatario: str) -> str:
    numero = "".join(c for c in str(destinatario) if c.isdigit())
    if not ativo():
        raise WhatsAppErro("Automacao do WhatsApp esta desligada.")
    if not remetente_permitido(numero):
        raise WhatsAppErro("Destinatario fora da lista autorizada para teste.")
    return numero


def _id_confirmado(resposta) -> str:
    if not resposta.ok:
        raise WhatsAppErro(f"A Cloud API recusou o envio (HTTP {resposta.status_code}).")
    try:
        identificador = str((resposta.json().get("messages") or [{}])[0].get("id") or "")
    except (ValueError, AttributeError, IndexError):
        identificador = ""
    if not identificador:
        raise WhatsAppErro("A Cloud API nao confirmou o identificador da mensagem.")
    return identificador


def _imagem_para_jpeg(imagem_url: str) -> bytes:
    """Baixa a capa pública e a converte para o formato aceito pelo WhatsApp."""
    try:
        from PIL import Image
    except ImportError as erro:
        raise WhatsAppErro("Conversor de imagens nao instalado no servidor.") from erro
    try:
        resposta = requests.get(imagem_url, timeout=20)
        resposta.raise_for_status()
    except requests.RequestException as erro:
        raise WhatsAppErro("Nao consegui baixar a capa do imovel.") from erro
    if len(resposta.content) > 15 * 1024 * 1024:
        raise WhatsAppErro("A capa do imovel e grande demais para conversao.")
    try:
        with Image.open(BytesIO(resposta.content)) as original:
            imagem = original.convert("RGB")
            imagem.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            destino = BytesIO()
            imagem.save(destino, format="JPEG", quality=86, optimize=True)
            convertido = destino.getvalue()
    except Exception as erro:
        raise WhatsAppErro("A capa do imovel nao e uma imagem valida.") from erro
    if not convertido or len(convertido) > 5 * 1024 * 1024:
        raise WhatsAppErro("A capa convertida excede o limite do WhatsApp.")
    return convertido


def _upload_imagem_jpeg(conteudo: bytes) -> str:
    token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "").strip()
    phone_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    versao = os.environ.get(
        "WHATSAPP_GRAPH_API_VERSION",
        os.environ.get("META_GRAPH_API_VERSION", "v26.0"),
    ).strip()
    try:
        resposta = requests.post(
            f"https://graph.facebook.com/{versao}/{phone_id}/media",
            headers={"Authorization": f"Bearer {token}"},
            data={"messaging_product": "whatsapp", "type": "image/jpeg"},
            files={"file": ("imovel.jpg", conteudo, "image/jpeg")},
            timeout=30,
        )
    except requests.RequestException as erro:
        raise WhatsAppErro("A Cloud API nao recebeu a capa do imovel.") from erro
    if not resposta.ok:
        raise WhatsAppErro(f"A Cloud API recusou a imagem (HTTP {resposta.status_code}).")
    try:
        media_id = str(resposta.json().get("id") or "")
    except (ValueError, AttributeError):
        media_id = ""
    if not media_id:
        raise WhatsAppErro("A Cloud API nao confirmou a imagem enviada.")
    return media_id


def enviar_texto(destinatario: str, texto: str) -> str:
    return _enviar_payload(
        destinatario,
        {
            "type": "text",
            "text": {"preview_url": True, "body": texto[:4096]},
        },
    )


def enviar_imagem(destinatario: str, imagem_url: str, legenda: str = "") -> str:
    """Envia uma imagem pública com legenda pela Cloud API oficial."""
    url = str(imagem_url or "").strip()
    analisada = urlparse(url)
    if analisada.scheme not in {"http", "https"} or not analisada.netloc:
        raise WhatsAppErro("A imagem precisa ter uma URL publica valida.")
    # Valida a allowlist antes de baixar ou subir qualquer arquivo externo.
    _validar_destinatario(destinatario)
    media_id = _upload_imagem_jpeg(_imagem_para_jpeg(url))
    imagem = {"id": media_id}
    if legenda.strip():
        imagem["caption"] = legenda.strip()[:1024]
    return _enviar_payload(destinatario, {"type": "image", "image": imagem})
