import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import emails  # type: ignore
import jwt
from jinja2 import Template
from jwt.exceptions import InvalidTokenError

from app.core.config import settings


@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    logging.info(f"send email result: {response}")


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.server_host}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.server_host,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)()
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None


import logging
import platform
import random
# -*- coding: utf-8 -*-
import string
import subprocess
import sys
import traceback

# import connexion


def rand_string(length):
    chars = string.ascii_letters + string.punctuation
    return "".join(random.choice(chars) for x in range(length))


def camel2snake(string):
    """
    convert camel case to snake case
    """
    if string is None:
        return None
    new_string = ""
    for c in string:
        if c >= "A" and c <= "Z":
            new_string += "_" + c.lower()
        else:
            new_string += c
    return new_string


def pyVerGt(version: str = "3.9.0") -> bool:
    pyVer = list(map(int, platform.python_version().split(".")))
    recVer = list(map(int, version.split(".")))
    return pyVer[1] >= recVer[1]


def portInUse(port: int) -> bool:
    import socket

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    res = sock.connect_ex(("localhost", int(port)))
    sock.close()
    return res == 0


# class Resolver(connexion.resolver.RestyResolver):
#     def resolve_operation_id_using_rest_semantics(self, operation):
#         """
#         Resolves the operationId using REST semantics
#         :type operation: connexion.operations.AbstractOperation
#         """

#         # Split the path into components delimited by '/'
#         path_components = [c for c in operation.path.split("/") if len(c)]

#         def is_var(component):
#             """True if the path component is a var. eg, '{id}'"""
#             return (component[0] == "{") and (component[-1] == "}")

#         resource_name = ".".join([c for c in path_components if not is_var(c)]).replace("-", "_")
#         if resource_name[-1] == "s":
#             resource_name = resource_name[:-1]

#         def get_controller_name():
#             x_router_controller = operation.router_controller

#             name = self.default_module_name

#             if x_router_controller:
#                 name = x_router_controller

#             elif resource_name:
#                 d = self.default_module_name
#                 r = resource_name
#                 # name = f"{d}.{r}.controller"
#                 name = f"{d}.controller.{r}"
#             return name

#         def get_function_name():
#             method = operation.method

#             is_collection_endpoint = method.lower() == "get" and len(resource_name) and not is_var(path_components[-1])

#             return self.collection_endpoint_name if is_collection_endpoint else method.lower()

#         return f"{get_controller_name()}.{get_function_name()}"

#     # TODO: find a better way to resolve this
#     def resolve_operation_id(self, operation):
#         # TODO: auto resolve /collection/{item}/collection

#         special = {
#             "/projects/importOptions/{project_type} getImportOptions": "paddlelabel.api.controller.project.import_options",
#             "/projects/{project_id}/tasks getTasks": "paddlelabel.api.controller.task.get_by_project",
#             "/projects/{project_id}/tasks setAll": "paddlelabel.api.controller.task.set_all_by_project",
#             "/projects/{project_id}/labels getLabels": "paddlelabel.api.controller.label.get_by_project",
#             "/projects/{project_id}/labels setLabels": "paddlelabel.api.controller.label.set_by_project",
#             "/projects/{project_id}/labels removeLabels": "paddlelabel.api.controller.label.delete_by_project",
#             "/projects/{project_id}/annotations getAnnotations": "paddlelabel.api.controller.annotation.get_by_project",
#             "/projects/{project_id}/tags getTags": "paddlelabel.api.controller.tag.get_by_project",
#             "/projects/{project_id}/progress getProgress": "paddlelabel.api.controller.task.get_stat_by_project",
#             "/projects/{project_id}/split splitDataset": "paddlelabel.api.controller.project.split_dataset",
#             "/projects/{project_id}/export exportDataset": "paddlelabel.api.controller.project.export_dataset",
#             "/projects/{project_id}/import importDataset": "paddlelabel.api.controller.project.import_additional_data",
#             "/projects/{project_id}/predict predict": "paddlelabel.api.controller.project.predict",
#             "/projects/{project_id}/toEasydata toEasydata": "paddlelabel.api.controller.project.to_easydata",
#             "/tasks/{task_id}/tags getTags": "paddlelabel.api.controller.tag.get_by_task",
#             "/tasks/{task_id}/tags addTag": "paddlelabel.api.controller.tag.add_to_task",
#             "/datas/{data_id}/image getImage": "paddlelabel.api.controller.data.get_image",
#             "/datas/{data_id}/mask getMask": "paddlelabel.api.controller.data.get_mask",
#             "/tasks/{task_id}/annotations getAnnotations": "paddlelabel.api.controller.annotation.get_by_task",
#             "/tasks/{task_id}/datas getDatas": "paddlelabel.api.controller.data.get_by_task",
#             "/datas/{data_id}/annotations getAnnotations": "paddlelabel.api.controller.annotation.get_by_data",
#             "/datas/{data_id}/annotations setAnnotations": "paddlelabel.api.controller.annotation.set_all_by_data",
#             "/datas/{data_id}/annotations deleteAnnotations": "paddlelabel.api.controller.annotation.delete_by_data",
#             "/rpc/folders getFolders": "paddlelabel.api.rpc.file.get_folders",
#             "/rpc/seg/polygon2points polygon2points": "paddlelabel.api.rpc.seg.polygon2points_str",
#             "/rpc/seg/points2polygon points2polygon": "paddlelabel.api.rpc.seg.points2polygon_str",
#             "/rpc/cache createCache": "paddlelabel.api.rpc.cache.create_cache",
#             "/rpc/cache/{cache_id} getCache": "paddlelabel.api.rpc.cache.get_cache",
#             "/debug/printid/{debug_id} printDebugId": "paddlelabel.api.rpc.debug.cmdOutputDebugId",
#             "/version getVersion": "paddlelabel.api.rpc.monitor.get_version",
#             "/samples loadSample": "paddlelabel.api.controller.sample.load_sample",
#             "/samples/structure getStructure": "paddlelabel.api.controller.sample.sample_folder_structure",
#             "/samples/file getFile": "paddlelabel.api.controller.sample.serve_sample_file",
#         }
#         opid = None

#         if operation.operation_id and operation.operation_id.startswith(__name__):
#             opid = operation.operation_id

#         path = operation.path
#         if path[:-1] == "/":
#             path = path[:-1]
#         idx = f"{path} {operation.operation_id}"
#         if idx in special.keys():
#             opid = special[idx]
#         # print("resolve resolve resolve", operation.operation_id, path, opid)
#         if opid:
#             router_controller = operation.router_controller
#             if router_controller is None:
#                 return opid
#             return f"{router_controller}.{opid}"

#         return self.resolve_operation_id_using_rest_semantics(operation)


def can_update(name: str = __name__, log: bool = False) -> bool:
    """
    Check pypi to see if a package can be updated

    Parameters
    ----------
    name : str, optional
        Package name. Defaults to __name__
    log : bool, optional
        Whether to print a message to cmd if update is available. Defaults to False

    Returns
    -------
    bool
        If the package is upgradeable from pypi
    """
    try:
        latest_version = str(
            subprocess.run(
                [sys.executable, "-m", "pip", "install", f"{name}==", "--retries", "1"],
                capture_output=True,
            )
        )
        version_start = "(from versions:"
        latest_version = latest_version[
            latest_version.find(version_start) + len(version_start) :
        ]
        latest_version = latest_version[: latest_version.find(")")]
        latest_version = latest_version.replace(" ", "").split(",")[-1]

        if latest_version == "none":
            return False

        current_version = subprocess.run(
            [sys.executable, "-m", "pip", "show", "{}".format(name)],
            capture_output=True,
        ).stdout.decode("utf8")
        if len(current_version) == 0:
            return False
        current_version = current_version[
            current_version.find("Version:") + len("Version:") :
        ]
        current_version = current_version.split("\n")[0].strip()

        # TODO: zero pad every part of version num @lin
        if latest_version > current_version:
            if log:
                logging.getLogger(__name__).info(
                    f"""
Currently installed {name} version is {current_version}, a newer version {latest_version} is available on pypi. Please consider updating {name} with:
    pip install --upgrade {name}
You can visit https://github.com/PaddleCV-SIG/PaddleLabel/blob/develop/doc/CN/release_notes.md to see more details about PaddleLabel updates."""
                )
            return True
        else:
            return False
    except:
        logging.getLogger(__name__).exception("Check for update from pypi failed")
        return False


def backend_error(error):
    """global error handling for backend

    Args:
        error (Exception): Any exception raised

    Returns:
        dict, int: response body, status code
    """
    print(traceback.format_exc())
    return {
        "title": "Backend error: " + str(error),
        "status": 500,
    }, 500
