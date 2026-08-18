#!/usr/bin/env python3
"""Build a Postman Collection v2.1 file from an EShop HW06 test catalog."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

from validate_catalog import load_catalog, validate_catalog


def script_event(listen: str, lines: list[str]) -> dict[str, Any]:
    return {"listen": listen, "script": {"type": "text/javascript", "exec": lines}}


def setup_script(case: dict[str, Any]) -> list[str]:
    actions = case.get("request", {}).get("setup", [])
    if not actions:
        return []
    lines = [
        "(async function () {",
        "const baseUrl = pm.variables.replaceIn('{{base_url}}');",
        "const studentId = pm.variables.replaceIn('{{student_id}}');",
        "async function send(method, path, body, token) {",
        "  const headers = { 'X-Student-Id': studentId };",
        "  if (body !== undefined) headers['Content-Type'] = 'application/json';",
        "  if (token) headers.Authorization = `Bearer ${token}`;",
        "  const response = await new Promise((resolve, reject) => {",
        "    pm.sendRequest({ url: baseUrl + path, method, header: headers, body: body === undefined ? undefined : { mode: 'raw', raw: JSON.stringify(body) } }, (error, result) => {",
        "      if (error) reject(error); else resolve(result);",
        "    });",
        "  });",
        "  if (response.code >= 500) throw new Error(`Setup ${method} ${path} failed with ${response.code}: ${response.text()}`);",
        "  return response;",
        "}",
        "async function login(email, password, saveAs) {",
        "  const response = await send('POST', '/api/login', { email, password });",
        "  if (response.code !== 200 || !response.json().token) throw new Error(`Setup login failed for ${email}: ${response.code}`);",
        "  pm.collectionVariables.set(saveAs, response.json().token);",
        "  return response.json().token;",
        "}",
    ]
    for action in actions:
        kind = action["action"]
        if kind == "login":
            role = action.get("role", "user")
            email = action.get("email", "admin@eshop.com" if role == "admin" else "test@eshop.com")
            password = action.get("password", "Admin123!" if role == "admin" else "Test1234!")
            save = action.get("save", f"{role}_token")
            lines.append(f"await login({json.dumps(email)}, {json.dumps(password)}, {json.dumps(save)});")
        elif kind == "forgot_otp":
            email = action.get("email", "test@eshop.com")
            save = action.get("save", "reset_token")
            lines += [
                f"const forgotResponse = await send('POST', '/api/forgot-password', {{ email: {json.dumps(email)} }});",
                "if (forgotResponse.code !== 200 || !forgotResponse.json().resetToken) throw new Error(`Setup forgot-password failed: ${forgotResponse.code}`);",
                f"pm.collectionVariables.set({json.dumps(save)}, forgotResponse.json().resetToken);",
            ]
        elif kind == "register_user":
            name = action.get("name", "HW06 Secondary User")
            email = action["email"]
            password = action.get("password", "Second123!")
            lines.append(f"await send('POST', '/api/register', {{ name: {json.dumps(name)}, email: {json.dumps(email)}, password: {json.dumps(password)} }});")
        elif kind == "create_order":
            token_var = action.get("token_var", "user_token")
            save = action.get("save", "order_id")
            total = action.get("total_amount", 200000)
            address = action.get("shipping_address", "123 Le Loi, TP.HCM")
            status = action.get("status", "pending")
            suffix = re_safe_name(save)
            lines += [
                f"const orderToken_{suffix} = pm.collectionVariables.get({json.dumps(token_var)});",
                f"const checkout_{suffix} = await send('POST', '/api/checkout', {{ total_amount: {json.dumps(total)}, shipping_address: {json.dumps(address)} }}, orderToken_{suffix});",
                f"if (checkout_{suffix}.code !== 200 || !checkout_{suffix}.json().orderId) throw new Error(`Setup checkout failed: ${{checkout_{suffix}.code}}`);",
                f"const orderId_{suffix} = checkout_{suffix}.json().orderId;",
                f"pm.collectionVariables.set({json.dumps(save)}, orderId_{suffix});",
            ]
            if status in {"confirmed", "shipping", "delivered"}:
                admin_var = action.get("admin_token_var", "admin_token")
                transitions = ["confirmed"]
                if status in {"shipping", "delivered"}:
                    transitions.append("shipping")
                if status == "delivered":
                    transitions.append("delivered")
                for step in transitions:
                    lines.append(f"await send('PUT', `/api/admin/orders/${{orderId_{suffix}}}/status`, {{ status: {json.dumps(step)} }}, pm.collectionVariables.get({json.dumps(admin_var)}));")
            elif status == "canceled":
                lines.append(f"await send('PUT', `/api/orders/${{orderId_{suffix}}}/cancel`, undefined, orderToken_{suffix});")
        elif kind == "create_category":
            token_var = action.get("token_var", "admin_token")
            name = action.get("name", "HW06 Setup Category")
            save = action.get("save", "category_id")
            suffix = re_safe_name(save)
            lines += [
                f"const categoryResponse_{suffix} = await send('POST', '/api/categories', {{ name: {json.dumps(name, ensure_ascii=False)} }}, pm.collectionVariables.get({json.dumps(token_var)}));",
                f"if (categoryResponse_{suffix}.code !== 200 || !categoryResponse_{suffix}.json().id) throw new Error(`Setup category failed: ${{categoryResponse_{suffix}.code}}`);",
                f"pm.collectionVariables.set({json.dumps(save)}, categoryResponse_{suffix}.json().id);",
            ]
        else:
            raise ValueError(f"{case['id']}: unsupported setup action {kind}")
    lines += [
        "})().catch((error) => { console.error('Setup failed:', error.message); pm.execution.skipRequest(); });",
    ]
    return lines


def re_safe_name(value: str) -> str:
    return "".join(ch if ch.isalnum() else "_" for ch in value)


def build_url(path: str, query: list[dict[str, Any]]) -> dict[str, Any]:
    raw = "{{base_url}}" + path
    enabled = [(str(q["key"]), str(q.get("value", ""))) for q in query if not q.get("disabled")]
    if enabled:
        raw += "?" + urlencode(enabled, safe="{}")
    return {
        "raw": raw,
        "host": ["{{base_url}}"],
        "path": [part for part in path.split("/") if part],
        "query": query,
    }


def request_item(name: str, method: str, path: str, body: Any = None, headers: dict[str, str] | None = None, tests: list[str] | None = None) -> dict[str, Any]:
    header_list = [{"key": key, "value": value, "type": "text"} for key, value in (headers or {}).items()]
    request: dict[str, Any] = {"method": method, "header": header_list, "url": build_url(path, [])}
    if body is not None:
        if not any(header["key"].lower() == "content-type" for header in header_list):
            header_list.append({"key": "Content-Type", "value": "application/json", "type": "text"})
        request["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, ensure_ascii=False, indent=2),
            "options": {"raw": {"language": "json"}},
        }
    item = {"name": name, "request": request}
    if tests:
        item["event"] = [script_event("test", tests)]
    return item


def setup_items(case: dict[str, Any]) -> list[dict[str, Any]]:
    """Render state setup as real sequential requests so Newman waits for each step."""
    items: list[dict[str, Any]] = []
    for index, action in enumerate(case.get("request", {}).get("setup", []), start=1):
        prefix = f"[SETUP {case['id']} #{index}]"
        kind = action["action"]
        if kind == "login":
            role = action.get("role", "user")
            email = action.get("email", "admin@eshop.com" if role == "admin" else "test@eshop.com")
            password = action.get("password", "Admin123!" if role == "admin" else "Test1234!")
            save = action.get("save", f"{role}_token")
            items.append(request_item(
                f"{prefix} Login {email}", "POST", "/api/login", {"email": email, "password": password},
                tests=[
                    f"pm.test({json.dumps(prefix + ' login succeeds')}, () => pm.response.to.have.status(200));",
                    "const setupBody = pm.response.json();",
                    "pm.expect(setupBody.token, 'setup token').to.be.a('string').and.not.empty;",
                    f"pm.collectionVariables.set({json.dumps(save)}, setupBody.token); pm.environment.set({json.dumps(save)}, setupBody.token);",
                ],
            ))
        elif kind == "forgot_otp":
            email = action.get("email", "test@eshop.com")
            save = action.get("save", "reset_token")
            items.append(request_item(
                f"{prefix} Issue OTP", "POST", "/api/forgot-password", {"email": email},
                tests=[
                    f"pm.test({json.dumps(prefix + ' OTP request succeeds')}, () => pm.response.to.have.status(200));",
                    "const setupBody = pm.response.json();",
                    "pm.expect(setupBody.resetToken, 'setup reset token').to.be.a('string').and.not.empty;",
                    f"pm.collectionVariables.set({json.dumps(save)}, setupBody.resetToken); pm.environment.set({json.dumps(save)}, setupBody.resetToken);",
                ],
            ))
        elif kind == "register_user":
            email = action["email"]
            body = {"name": action.get("name", "HW06 Secondary User"), "email": email, "password": action.get("password", "Second123!")}
            items.append(request_item(
                f"{prefix} Register {email}", "POST", "/api/register", body,
                tests=[f"pm.test({json.dumps(prefix + ' registration succeeds')}, () => pm.response.to.have.status(200));"],
            ))
        elif kind == "create_order":
            token_var = action.get("token_var", "user_token")
            save = action.get("save", "order_id")
            body = {"total_amount": action.get("total_amount", 200000), "shipping_address": action.get("shipping_address", "123 Le Loi, TP.HCM")}
            items.append(request_item(
                f"{prefix} Create order", "POST", "/api/checkout", body,
                {"Authorization": f"Bearer {{{{{token_var}}}}}"},
                [
                    f"pm.test({json.dumps(prefix + ' checkout succeeds')}, () => pm.response.to.have.status(200));",
                    "const setupBody = pm.response.json();",
                    "pm.expect(setupBody.orderId, 'setup order id').to.exist;",
                    f"pm.collectionVariables.set({json.dumps(save)}, setupBody.orderId); pm.environment.set({json.dumps(save)}, setupBody.orderId);",
                ],
            ))
            status = action.get("status", "pending")
            if status in {"confirmed", "shipping", "delivered"}:
                transitions = ["confirmed"]
                if status in {"shipping", "delivered"}:
                    transitions.append("shipping")
                if status == "delivered":
                    transitions.append("delivered")
                admin_var = action.get("admin_token_var", "admin_token")
                for transition_index, transition in enumerate(transitions, start=1):
                    items.append(request_item(
                        f"{prefix}.{transition_index} Set order {transition}", "PUT", f"/api/admin/orders/{{{{{save}}}}}/status", {"status": transition},
                        {"Authorization": f"Bearer {{{{{admin_var}}}}}"},
                        [f"pm.test({json.dumps(prefix + ' status transition succeeds')}, () => pm.response.to.have.status(200));"],
                    ))
            elif status == "canceled":
                items.append(request_item(
                    f"{prefix}.1 Cancel order", "PUT", f"/api/orders/{{{{{save}}}}}/cancel", None,
                    {"Authorization": f"Bearer {{{{{token_var}}}}}"},
                    [f"pm.test({json.dumps(prefix + ' cancellation succeeds')}, () => pm.response.to.have.status(200));"],
                ))
        elif kind == "create_category":
            token_var = action.get("token_var", "admin_token")
            save = action.get("save", "category_id")
            name = action.get("name", "HW06 Setup Category")
            items.append(request_item(
                f"{prefix} Create category", "POST", "/api/categories", {"name": name},
                {"Authorization": f"Bearer {{{{{token_var}}}}}"},
                [
                    f"pm.test({json.dumps(prefix + ' category creation succeeds')}, () => pm.response.to.have.status(200));",
                    "const setupBody = pm.response.json();",
                    "pm.expect(setupBody.id, 'setup category id').to.exist;",
                    f"pm.collectionVariables.set({json.dumps(save)}, setupBody.id); pm.environment.set({json.dumps(save)}, setupBody.id);",
                ],
            ))
        else:
            raise ValueError(f"{case['id']}: unsupported setup action {kind}")
    return items


def test_script(case: dict[str, Any]) -> list[str]:
    expected = case["expected"]
    statuses = expected["status"]
    lines = [
        f"pm.test({json.dumps(case['id'] + ' status is allowed')}, function () {{",
        f"  pm.expect({json.dumps(statuses)}).to.include(pm.response.code);",
        "});",
    ]
    if expected.get("content_type"):
        lines += [
            f"pm.test({json.dumps(case['id'] + ' content type')}, function () {{",
            f"  pm.expect(pm.response.headers.get('Content-Type') || '').to.include({json.dumps(expected['content_type'])});",
            "});",
        ]
    needs_json = "json_schema" in expected or expected.get("json_path_assertions")
    if needs_json:
        lines += [
            "let body = {};",
            "try { body = pm.response.json(); } catch (error) { console.log('Response is not valid JSON:', error.message); }",
        ]
    if "json_schema" in expected:
        schema = json.dumps(expected["json_schema"], ensure_ascii=False, separators=(",", ":"))
        lines += [
            f"const schema = {schema};",
            f"pm.test({json.dumps(case['id'] + ' response schema')}, function () {{",
            "  const responseType = pm.response.headers.get('Content-Type') || '';",
            "  if (!responseType.includes('application/json')) pm.expect.fail('response is not JSON');",
            "  else pm.response.to.have.jsonSchema(schema);",
            "});",
        ]
    assertions = expected.get("json_path_assertions", [])
    if assertions:
        lines += [
            "function readPath(root, path) {",
            "  return path.split('.').filter(Boolean).reduce((value, key) => value == null ? undefined : value[key], root);",
            "}",
        ]
        for idx, assertion in enumerate(assertions, start=1):
            path = assertion["path"]
            op = assertion.get("operator", "equals")
            value = assertion.get("value")
            name = f"{case['id']} JSON assertion {idx}: {path} {op}"
            lines += [f"pm.test({json.dumps(name)}, function () {{", f"  const actual = readPath(body, {json.dumps(path)});"]
            if op == "equals":
                lines.append(f"  pm.expect(actual).to.eql({json.dumps(value, ensure_ascii=False)});")
            elif op == "exists":
                lines.append("  pm.expect(actual).to.not.equal(undefined);")
            elif op == "not_exists":
                lines.append("  pm.expect(actual).to.equal(undefined);")
            elif op == "type":
                lines.append(f"  pm.expect(typeof actual).to.equal({json.dumps(value)});")
            elif op == "matches":
                lines.append(f"  pm.expect(String(actual)).to.match(new RegExp({json.dumps(value)}));")
            elif op == "includes":
                lines.append(f"  pm.expect(actual).to.include({json.dumps(value, ensure_ascii=False)});")
            else:
                raise ValueError(f"{case['id']}: unsupported assertion operator {op}")
            lines.append("});")
    lines.extend(expected.get("custom_tests", []))
    return lines


def case_item(case: dict[str, Any]) -> dict[str, Any]:
    request = case["request"]
    headers = [{"key": str(k), "value": str(v), "type": "text"} for k, v in request.get("headers", {}).items()]
    body = request.get("body")
    request_json: dict[str, Any] = {
        "method": request["method"],
        "header": headers,
        "url": build_url(request["path"], request.get("query", [])),
        "description": f"Prerequisite: {case['prerequisite']}\nOracle: {case['oracle']}",
    }
    if "raw_body" in request:
        if not any(h["key"].lower() == "content-type" for h in headers):
            headers.append({"key": "Content-Type", "value": "application/json", "type": "text"})
        request_json["body"] = {
            "mode": "raw",
            "raw": request["raw_body"],
            "options": {"raw": {"language": "json"}},
        }
    elif body is not None:
        if not any(h["key"].lower() == "content-type" for h in headers):
            headers.append({"key": "Content-Type", "value": "application/json", "type": "text"})
        request_json["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, ensure_ascii=False, indent=2),
            "options": {"raw": {"language": "json"}},
        }
    events = [script_event("test", test_script(case))]
    return {
        "name": f"{case['id']} - {case.get('title', 'Unnamed case')}",
        "request": request_json,
        "event": events,
    }


def build_collection(data: dict[str, Any]) -> dict[str, Any]:
    meta = data["meta"]
    prerequest = [
        "const studentId = pm.variables.replaceIn('{{student_id}}');",
        "if (!studentId || studentId === '{{student_id}}') { throw new Error('student_id is required'); }",
        "pm.request.headers.upsert({ key: 'X-Student-Id', value: studentId });",
        "console.log('X-Student-Id:', studentId);",
    ]
    return {
        "info": {
            "name": f"{meta['student_id']} HW06 EShop API Tests",
            "description": "Generated from the reviewed HW06 catalog. Expected results come from the EShop specification.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "variable": [
            {"key": "base_url", "value": meta["base_url"]},
            {"key": "student_id", "value": meta["student_id"]},
        ],
        "event": [script_event("prerequest", prerequest)],
        "item": [
            {
                "name": f"Pool {api['pool']} - {api['api_id']} - {api['feature']}",
                "description": api["contract"],
                "item": [
                    item
                    for case in api["cases"]
                    if case.get("audit", {}).get("verdict") != "INVALID" and case.get("automation") != "MANUAL"
                    for item in [*setup_items(case), case_item(case)]
                ],
            }
            for api in data["apis"]
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalog", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--check", action="store_true", help="validate generated structure without writing")
    parser.add_argument("--allow-partial", action="store_true")
    args = parser.parse_args()
    try:
        data = load_catalog(args.catalog)
        errors = validate_catalog(data, args.allow_partial)
        if errors:
            print(json.dumps({"built": False, "errors": errors}, ensure_ascii=False, indent=2))
            return 1
        collection = build_collection(data)
        encoded = json.dumps(collection, ensure_ascii=False, indent=2) + "\n"
        json.loads(encoded)
        if not args.check:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(encoded, encoding="utf-8")
        automated_cases = sum(1 for api in data["apis"] for case in api["cases"] if case.get("audit", {}).get("verdict") != "INVALID" and case.get("automation") != "MANUAL")
        request_items = sum(len(folder["item"]) for folder in collection["item"])
        print(json.dumps({"built": True, "automated_cases": automated_cases, "request_items": request_items, "output": None if args.check else str(args.output)}, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, json.JSONDecodeError, KeyError) as exc:
        print(json.dumps({"built": False, "errors": [str(exc)]}, ensure_ascii=False, indent=2))
        return 2


if __name__ == "__main__":
    sys.exit(main())
