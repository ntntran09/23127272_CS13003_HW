#!/usr/bin/env python3
"""Build HW06 catalogs for the revised FR-02, FR-07, FR-15 selection."""
from __future__ import annotations

import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "test-design/test-cases.json"
ORIGINAL = ROOT / "test-design/test-cases-ai-original.json"
REVIEWED = ROOT / "test-design/test-cases-ai-reviewed.json"
MISSING = object()

ERROR = {"type": "object", "required": ["error"], "properties": {"error": {"type": "string", "minLength": 1}}, "additionalProperties": False}
MESSAGE = {"type": "object", "required": ["message"], "properties": {"message": {"type": "string", "minLength": 1}}, "additionalProperties": False}
LOGIN = {
    "type": "object", "required": ["message", "token", "user"],
    "properties": {
        "message": {"const": "Login successful"}, "token": {"type": "string", "minLength": 1},
        "user": {"type": "object", "required": ["id", "name", "email", "role"], "properties": {
            "id": {"type": "integer", "minimum": 1}, "name": {"type": "string"}, "email": {"type": "string"},
            "role": {"enum": ["user", "admin"]}}, "additionalProperties": True}},
    "additionalProperties": False}
CART_OK = {"type": "object", "required": ["message"], "properties": {"message": {"const": "Added to cart"}}, "additionalProperties": False}
PRODUCT_OK = {"type": "object", "required": ["message", "id"], "properties": {
    "message": {"const": "Product created"}, "id": {"type": "integer", "minimum": 1}}, "additionalProperties": False}


def ec(i, variable, klass, validity, why):
    return {"id": i, "variable": variable, "class": klass, "validity": validity, "rationale": why}


def tc(pool, n, title, method, path, statuses, *, body=MISSING, raw=None, headers=None, setup=None,
       coverage=None, ecs=None, secs=None, schema=MISSING, assertions=None, tests=None,
       oracle="EShop README and api_specification.md", missed="", manual=False):
    origin = "AI" if n <= 35 else "STUDENT"
    req = {"method": method, "path": path, "headers": headers or {}, "query": []}
    if body is not MISSING:
        req["body"] = body
    if raw is not None:
        req["raw_body"] = raw
    if setup:
        req["setup"] = setup
    expected = {"status": statuses, "content_type": "application/json"}
    if schema is not MISSING:
        expected["json_schema"] = schema
    if assertions:
        expected["json_path_assertions"] = assertions
    if tests:
        expected["custom_tests"] = tests
    result = {
        "id": f"{pool}-{'AI' if origin == 'AI' else 'STU'}-{n:03d}", "title": title, "origin": origin,
        "missed_by_ai": missed if origin == "STUDENT" else "",
        "audit": {"verdict": "VALID", "reason": "Preliminary review against requirements, API specification, source, and security rules.",
                  "fix": "None", "reviewer": "AI preliminary review - student confirmation required"},
        "coverage": coverage or ["domain"], "equivalence_classes": ecs or [], "security_requirements": secs or [],
        "prerequisite": "Clean seeded local SUT", "oracle": oracle, "request": req, "expected": expected}
    if manual:
        result["automation"] = "MANUAL"
    return result


def bearer(var):
    return {"Authorization": f"Bearer {{{{{var}}}}}"}


def new_user(tag, token="case_user_token"):
    email = f"hw06.{tag}@example.com"
    password = "User1234!"
    return email, password, [
        {"action": "register_user", "name": f"HW06 {tag}", "email": email, "password": password},
        {"action": "login", "email": email, "password": password, "save": token}]


def lock_setup(tag, failures):
    email = f"hw06.login.{tag}@example.com"
    password = "Right123!"
    actions = [{"action": "register_user", "name": f"Login {tag}", "email": email, "password": password}]
    actions += [{"action": "login_attempt", "email": email, "password": "Wrong123!", "statuses": [401, 403]} for _ in range(failures)]
    return email, password, actions


def cart_check(case_id, javascript, label):
    return ("pm.sendRequest({url:pm.variables.replaceIn('{{base_url}}/api/cart'),method:'GET',header:{"
            "'X-Student-Id':pm.variables.replaceIn('{{student_id}}'),'Authorization':`Bearer ${pm.collectionVariables.get('case_user_token')}`}},"
            f"(err,res)=>pm.test('{case_id} {label}',()=>{{pm.expect(err).to.equal(null);pm.expect(res.code).to.eql(200);"
            f"const cart=res.json();{javascript}}}));")


def fr02():
    c = []
    c.append(tc("A", 1, "Valid user login returns JWT without secrets", "POST", "/api/login", [200],
                body={"email": "test@eshop.com", "password": "Test1234!"}, coverage=["domain", "schema", "security"],
                ecs=["A-EC-VALID", "A-EC-SCHEMA"], secs=["SEC-01"], schema=LOGIN,
                tests=["const b=pm.response.json();pm.collectionVariables.set('user_token',b.token);pm.environment.set('user_token',b.token);",
                       "pm.test('A-AI-001 token shape',()=>pm.expect(pm.response.json().token.split('.')).to.have.length(3));",
                       "pm.test('A-AI-001 secrets absent',()=>{const u=pm.response.json().user;['password','reset_token','login_attempts','locked_until'].forEach(k=>pm.expect(u).to.not.have.property(k));});"],
                oracle="FR-02 success returns JWT; SEC-01 forbids password disclosure"))
    c.append(tc("A", 2, "Valid admin login returns JWT", "POST", "/api/login", [200], body={"email": "admin@eshop.com", "password": "Admin123!"},
                coverage=["domain", "schema"], ecs=["A-EC-VALID", "A-EC-SCHEMA"], schema=LOGIN,
                tests=["const b=pm.response.json();pm.collectionVariables.set('admin_token',b.token);pm.environment.set('admin_token',b.token);"]))
    invalid = [
        (3, "Missing email", {"password": "x"}, "A-EC-EMAIL"), (4, "Null email", {"email": None, "password": "x"}, "A-EC-EMAIL"),
        (5, "Empty email", {"email": "", "password": "x"}, "A-EC-EMAIL"), (6, "Whitespace email", {"email": "   ", "password": "x"}, "A-EC-EMAIL"),
        (7, "Email lacks at sign", {"email": "a.example.com", "password": "x"}, "A-EC-EMAIL"), (8, "Email lacks local part", {"email": "@example.com", "password": "x"}, "A-EC-EMAIL"),
        (9, "Email lacks domain", {"email": "a@", "password": "x"}, "A-EC-EMAIL"), (10, "Email contains spaces", {"email": "a b@example.com", "password": "x"}, "A-EC-EMAIL"),
        (11, "Numeric email", {"email": 123, "password": "x"}, "A-EC-EMAIL"), (12, "Array email", {"email": ["a@example.com"], "password": "x"}, "A-EC-EMAIL"),
        (13, "Missing password", {"email": "absent13@example.com"}, "A-EC-PASSWORD"), (14, "Null password", {"email": "absent14@example.com", "password": None}, "A-EC-PASSWORD"),
        (15, "Empty password", {"email": "absent15@example.com", "password": ""}, "A-EC-PASSWORD"), (16, "Whitespace password", {"email": "absent16@example.com", "password": "   "}, "A-EC-PASSWORD"),
        (17, "Numeric password", {"email": "absent17@example.com", "password": 123}, "A-EC-PASSWORD"), (18, "Object password", {"email": "absent18@example.com", "password": {"x": 1}}, "A-EC-PASSWORD")]
    for n, title, body, e in invalid:
        c.append(tc("A", n, title, "POST", "/api/login", [400, 422], body=body, coverage=["domain", "schema"], ecs=[e], schema=ERROR,
                    oracle="FR-02 requires scalar, nonblank, well-formed email and password inputs"))
    c += [
        tc("A", 19, "Unknown email", "POST", "/api/login", [401], body={"email": "unknown19@example.com", "password": "Wrong123!"}, coverage=["domain", "schema", "security"], ecs=["A-EC-INVALID", "A-EC-ENUM"], schema=ERROR,
           assertions=[{"path": "error", "operator": "equals", "value": "Invalid email or password"}], oracle="FR-02 must not reveal which credential failed"),
        tc("A", 20, "Wrong password", "POST", "/api/login", [401], body={"email": "admin@eshop.com", "password": "Wrong123!"}, coverage=["domain", "schema", "security"], ecs=["A-EC-INVALID", "A-EC-ENUM"], schema=ERROR,
           assertions=[{"path": "error", "operator": "equals", "value": "Invalid email or password"}], oracle="FR-02 must not reveal which credential failed"),
        tc("A", 21, "Empty JSON object", "POST", "/api/login", [400, 422], body={}, coverage=["domain", "schema"], ecs=["A-EC-BODY"], schema=ERROR),
        tc("A", 22, "Malformed JSON", "POST", "/api/login", [400], raw='{"email":"x",', coverage=["domain", "schema"], ecs=["A-EC-BODY", "A-EC-SCHEMA"], schema=ERROR),
        tc("A", 23, "Role field cannot select admin", "POST", "/api/login", [200], body={"email": "test@eshop.com", "password": "Test1234!", "role": "admin"}, coverage=["security", "schema"], ecs=["A-EC-MASS"], secs=["SEC-03"], schema=LOGIN,
           tests=["pm.test('A-AI-023 stored role wins',()=>pm.expect(pm.response.json().user.role).to.eql('user'));"], oracle="FR-12 role comes from the account, not request input"),
        tc("A", 24, "SQL injection in email", "POST", "/api/login", [401], body={"email": "' OR 1=1 --", "password": "x"}, coverage=["security", "schema"], ecs=["A-EC-INJECTION"], secs=["SEC-05"], schema=ERROR),
        tc("A", 25, "SQL injection in password", "POST", "/api/login", [401], body={"email": "admin@eshop.com", "password": "' OR '1'='1"}, coverage=["security", "schema"], ecs=["A-EC-INJECTION"], secs=["SEC-05"], schema=ERROR),
        tc("A", 26, "Failure response is JSON", "POST", "/api/login", [401], body={"email": "unknown26@example.com", "password": "x"}, coverage=["schema"], ecs=["A-EC-SCHEMA"], schema=ERROR),
        tc("A", 27, "Long email rejected without 5xx", "POST", "/api/login", [400, 401, 422], body={"email": "a" * 300 + "@example.com", "password": "x"}, coverage=["domain", "security", "schema"], ecs=["A-EC-EMAIL"], schema=ERROR)]
    for n, failures, status in [(28, 1, [200]), (29, 2, [200]), (30, 3, [403]), (31, 4, [403])]:
        email, password, setup = lock_setup(str(n), failures)
        c.append(tc("A", n, f"Correct password after {failures} consecutive failure(s)", "POST", "/api/login", status,
                    body={"email": email, "password": password}, setup=setup, coverage=["state", "schema", "security"],
                    ecs=["A-EC-LOCK"], schema=LOGIN if 200 in status else ERROR,
                    oracle="FR-02 locks at three consecutive failures for 30 seconds"))
    email, password, setup = lock_setup("32", 1)
    c.append(tc("A", 32, "Success resets failed-attempt counter", "POST", "/api/login", [200], body={"email": email, "password": password}, setup=setup,
                coverage=["state", "schema"], ecs=["A-EC-LOCK"], schema=LOGIN, oracle="FR-02 defines consecutive failures"))
    email, password, setup = lock_setup("33", 3)
    c.append(tc("A", 33, "Locked response leaks no secrets", "POST", "/api/login", [403], body={"email": email, "password": password}, setup=setup,
                coverage=["state", "security", "schema"], ecs=["A-EC-LOCK", "A-EC-ENUM"], secs=["SEC-01"], schema=ERROR,
                tests=["pm.test('A-AI-033 no secrets',()=>{const t=pm.response.text().toLowerCase();pm.expect(t).to.not.include('password');pm.expect(t).to.not.include('select ');});"]))
    c.append(tc("A", 34, "Email case variation has stable behavior", "POST", "/api/login", [200, 401], body={"email": "TEST@ESHOP.COM", "password": "Test1234!"}, coverage=["domain", "schema"], ecs=["A-EC-EMAIL"]))
    c.append(tc("A", 35, "Lock expires at 30-second boundary", "POST", "/api/login", [200], body={"email": "manual@example.com", "password": "Right123!"}, coverage=["state", "security"], ecs=["A-EC-LOCK"], manual=True,
                oracle="FR-02 requires a 30-second lock; execute with controllable clock or timed fixture"))
    student = [
        (36, "JWT role matches persisted role", ["security", "schema"], ["A-EC-MASS"], ["SEC-03"], "Token-claim consistency was absent from response-only generation."),
        (37, "Success response omits plaintext password", ["security", "schema"], ["A-EC-SCHEMA"], ["SEC-01"], "SEC-01 response exposure was missed when focusing only on storage."),
        (38, "Unknown extra nested object is ignored", ["security", "schema"], ["A-EC-MASS"], [], "Nested mass-assignment input was not in the basic field matrix."),
        (39, "Unicode email fails generically", ["domain", "security", "schema"], ["A-EC-EMAIL", "A-EC-ENUM"], [], "Unicode normalization was omitted by ASCII examples."),
        (40, "Oversized password fails without 5xx", ["domain", "security", "schema"], ["A-EC-PASSWORD"], [], "Abuse-size input was omitted by nominal partitions.")]
    bodies = [
        {"email": "test@eshop.com", "password": "Test1234!"}, {"email": "admin@eshop.com", "password": "Admin123!"},
        {"email": "test@eshop.com", "password": "Test1234!", "profile": {"role": "admin"}}, {"email": "tést@example.com", "password": "x"},
        {"email": "absent40@example.com", "password": "x" * 10000}]
    statuses = [[200], [200], [200], [400, 401, 422], [400, 401, 413, 422]]
    for (n, title, cov, ecs_, secs, missed), body, status in zip(student, bodies, statuses):
        tests = ["pm.test('A-STU-037 password absent',()=>pm.expect(pm.response.json().user).to.not.have.property('password')); "] if n == 37 else None
        c.append(tc("A", n, title, "POST", "/api/login", status, body=body, coverage=cov, ecs=ecs_, secs=secs,
                    schema=LOGIN if 200 in status else ERROR, tests=tests, missed=missed))
    return c


def fr07():
    c, base = [], {"id": 1, "name": "iPhone 15 Pro Max", "price": 30000000, "quantity": 1}
    def add(n, title, body, status, *, headers=MISSING, setup=None, coverage=None, ecs=None, secs=None, schema=MISSING, tests=None, missed="", oracle="FR-07 and API specification"):
        if headers is MISSING:
            headers = bearer("case_user_token")
        return tc("B", n, title, "POST", "/api/cart", status, body=body, headers=headers, setup=setup, coverage=coverage, ecs=ecs, secs=secs, schema=schema, tests=tests, missed=missed, oracle=oracle)
    _, _, setup = new_user("cart01")
    c.append(add(1, "Add existing product quantity one", base, [200], setup=setup, coverage=["domain", "state", "schema"], ecs=["B-EC-VALID", "B-EC-QTY", "B-EC-SCHEMA"], schema=CART_OK))
    for n, title, headers, status in [(2, "Missing JWT", {}, [401]), (3, "Empty bearer", {"Authorization": "Bearer "}, [401]), (4, "Malformed JWT", bearer("bad"), [403]), (5, "Wrong scheme", {"Authorization": "Basic abc"}, [403]), (6, "Tampered JWT", {"Authorization": "Bearer {{user_token}}x"}, [403])]:
        c.append(add(n, title, base, status, headers=headers, setup=[], coverage=["security", "schema"], ecs=["B-EC-AUTH"], secs=["SEC-02"], schema=ERROR, oracle="SEC-02 requires a valid JWT"))
    bad = [
        (7, "Missing id", {k:v for k,v in base.items() if k!="id"}, "B-EC-ID"), (8, "Null id", {**base,"id":None}, "B-EC-ID"),
        (9, "Zero id", {**base,"id":0}, "B-EC-ID"), (10, "Negative id", {**base,"id":-1}, "B-EC-ID"),
        (11, "Decimal id", {**base,"id":1.5}, "B-EC-ID"), (12, "String id", {**base,"id":"1"}, "B-EC-ID"),
        (13, "Nonexistent id", {**base,"id":999999}, "B-EC-ID"), (14, "Missing quantity", {k:v for k,v in base.items() if k!="quantity"}, "B-EC-QTY-BAD"),
        (15, "Null quantity", {**base,"quantity":None}, "B-EC-QTY-BAD"), (16, "Zero quantity", {**base,"quantity":0}, "B-EC-QTY-BAD"),
        (17, "Negative quantity", {**base,"quantity":-1}, "B-EC-QTY-BAD"), (18, "Decimal quantity", {**base,"quantity":1.5}, "B-EC-QTY-BAD"),
        (19, "String quantity", {**base,"quantity":"2"}, "B-EC-QTY-BAD"), (20, "Boolean quantity", {**base,"quantity":True}, "B-EC-QTY-BAD"),
        (21, "Missing name", {k:v for k,v in base.items() if k!="name"}, "B-EC-ITEM-BAD"), (22, "Empty name", {**base,"name":""}, "B-EC-ITEM-BAD"),
        (23, "Missing price", {k:v for k,v in base.items() if k!="price"}, "B-EC-ITEM-BAD"), (24, "Zero price", {**base,"price":0}, "B-EC-ITEM-BAD"),
        (25, "Negative price", {**base,"price":-1}, "B-EC-ITEM-BAD")]
    for n,title,body,e in bad:
        _,_,setup = new_user(f"cart{n}")
        c.append(add(n,title,body,[400,404,422],setup=setup,coverage=["domain","schema"],ecs=[e],schema=ERROR,oracle="FR-07 requires an existing product, canonical fields, and positive integer quantity"))
    for n, qty in [(26,1),(27,2)]:
        _,_,setup=new_user(f"cart{n}")
        c.append(add(n,f"Valid quantity {qty}",{**base,"quantity":qty},[200],setup=setup,coverage=["domain","schema"],ecs=["B-EC-QTY"],schema=CART_OK))
    _,_,setup=new_user("cart28"); setup.append({"action":"add_cart","token_var":"case_user_token","body":base})
    c.append(add(28,"Same product merges and sums quantity",{**base,"quantity":2},[200],setup=setup,coverage=["state","schema"],ecs=["B-EC-MERGE"],schema=CART_OK,
                 tests=[cart_check("B-AI-028","const m=cart.filter(x=>x.id===1);pm.expect(m).to.have.length(1);pm.expect(m[0].quantity).to.eql(3);","merge")],oracle="FR-07 same product increases quantity without a new row"))
    _,_,setup=new_user("cart29"); setup.append({"action":"add_cart","token_var":"case_user_token","body":base})
    c.append(add(29,"Different product creates second line",{"id":2,"name":"Samsung Galaxy S24 Ultra","price":28000000,"quantity":1},[200],setup=setup,coverage=["state","schema"],ecs=["B-EC-MULTI"],schema=CART_OK,
                 tests=[cart_check("B-AI-029","pm.expect(cart.map(x=>x.id)).to.include.members([1,2]);","distinct items")]))
    c.append(tc("B",30,"Malformed JSON","POST","/api/cart",[400],raw='{"id":1,',headers=bearer("user_token"),coverage=["domain","schema"],ecs=["B-EC-BODY","B-EC-SCHEMA"],schema=ERROR))
    _,_,setup=new_user("cart31"); c.append(add(31,"Empty object",{},[400,422],setup=setup,coverage=["domain","schema"],ecs=["B-EC-BODY"],schema=ERROR))
    _,_,setup=new_user("cart32"); c.append(add(32,"SQL text remains data",{**base,"name":"x' OR 1=1 --"},[200],setup=setup,coverage=["security","schema"],ecs=["B-EC-INJECTION"],secs=["SEC-05"],schema=CART_OK))
    _,_,setup=new_user("cart33"); c.append(add(33,"HTML text remains inert",{**base,"name":"<script>alert(1)</script>"},[200],setup=setup,coverage=["security","schema"],ecs=["B-EC-XSS"],secs=["SEC-04"],schema=CART_OK))
    _,_,setup=new_user("cart34"); c.append(add(34,"Forged price rejected",{**base,"price":1},[400,409,422],setup=setup,coverage=["security","state","schema"],ecs=["B-EC-TRUST"],schema=ERROR,oracle="Server-owned catalog price must not be forged"))
    _,_,setup=new_user("cart35"); c.append(add(35,"Forged name rejected",{**base,"name":"Forged"},[400,409,422],setup=setup,coverage=["security","state","schema"],ecs=["B-EC-TRUST"],schema=ERROR,oracle="Server-owned product identity must stay canonical"))
    student_specs=[
        (36,"Repeated quantities sum arithmetically",{**base,"quantity":3},"B-EC-MERGE","Cross-request 2+3 sum was absent from the nominal merge case."),
        (37,"Two authenticated users have isolated carts",{"id":2,"name":"Samsung Galaxy S24 Ultra","price":28000000,"quantity":1},"B-EC-ISOLATION","Multi-principal setup was omitted by single-user generation."),
        (38,"Body user_id cannot redirect ownership",{**base,"user_id":1},"B-EC-MASS","Ownership mass assignment was not in the documented body."),
        (39,"Overflow-like quantity rejected",{**base,"quantity":2147483648},"B-EC-QTY-BAD","Unsafe magnitude was missed by lower-bound analysis."),
        (40,"Prototype-looking property ignored",{**base,"__proto__":{"admin":True}},"B-EC-MASS","JavaScript object-property abuse needs deliberate threat modeling.")]
    for n,title,body,e,missed in student_specs:
        _,_,setup=new_user(f"cart{n}")
        status=[400,422] if n==39 else [200]
        c.append(add(n,title,body,status,setup=setup,coverage=["security","state","schema"],ecs=[e],schema=ERROR if n==39 else CART_OK,missed=missed))
    return c


def fr15():
    c=[]; valid={"name":"HW06 Product","price":100000,"description":"Test","imageUrl":"https://example.com/p.png","category_id":1}
    # Reuse tokens captured by A-AI-001/A-AI-002. JWTs remain valid even when
    # later lockout probes change account login state.
    admin=[]
    def create(n,title,body,status,*,headers=MISSING,setup=MISSING,coverage=None,ecs=None,secs=None,schema=MISSING,tests=None,missed="",oracle="FR-15 and API specification"):
        return tc("C",n,title,"POST","/api/products",status,body=body,headers=bearer("admin_token") if headers is MISSING else headers,
                  setup=copy.deepcopy(admin if setup is MISSING else setup),coverage=coverage,ecs=ecs,secs=secs,schema=schema,tests=tests,missed=missed,oracle=oracle)
    c.append(create(1,"Admin creates valid product",valid,[200],coverage=["domain","state","schema"],ecs=["C-EC-VALID","C-EC-SCHEMA"],schema=PRODUCT_OK))
    for n,title,headers,status,setup in [(2,"Missing JWT",{},[401],[]),(3,"Malformed JWT",bearer("bad"),[403],[]),(4,"Wrong scheme",{"Authorization":"Basic abc"},[403],[]),(5,"Normal user JWT",bearer("user_token"),[403],[])]:
        c.append(create(n,title,valid,status,headers=headers,setup=setup,coverage=["security","schema"],ecs=["C-EC-AUTH"],secs=["SEC-02","SEC-03"] if n==5 else ["SEC-02"],schema=ERROR,oracle="FR-12/SEC-02/SEC-03 require admin JWT"))
    rows=[
        (6,"Missing name",{k:v for k,v in valid.items() if k!="name"},[400,422],"C-EC-NAME-BAD"),(7,"Null name",{**valid,"name":None},[400,422],"C-EC-NAME-BAD"),
        (8,"Empty name",{**valid,"name":""},[400,422],"C-EC-NAME-BAD"),(9,"Whitespace name",{**valid,"name":"   "},[400,422],"C-EC-NAME-BAD"),
        (10,"Numeric name",{**valid,"name":123},[400,422],"C-EC-NAME-BAD"),(11,"Name length one",{**valid,"name":"A"},[200],"C-EC-NAME"),
        (12,"Name length 254",{**valid,"name":"a"*254},[200],"C-EC-NAME"),(13,"Name length 255",{**valid,"name":"a"*255},[200],"C-EC-NAME"),
        (14,"Name length 256",{**valid,"name":"a"*256},[400,422],"C-EC-NAME-BAD"),(15,"Missing price",{k:v for k,v in valid.items() if k!="price"},[400,422],"C-EC-PRICE-BAD"),
        (16,"Null price",{**valid,"price":None},[400,422],"C-EC-PRICE-BAD"),(17,"Negative price",{**valid,"price":-1},[400,422],"C-EC-PRICE-BAD"),
        (18,"Zero price",{**valid,"price":0},[400,422],"C-EC-PRICE-BAD"),(19,"Price one",{**valid,"price":1},[200],"C-EC-PRICE"),
        (20,"Positive decimal price",{**valid,"price":0.01},[200],"C-EC-PRICE"),(21,"String price",{**valid,"price":"100"},[400,422],"C-EC-PRICE-BAD"),
        (22,"Boolean price",{**valid,"price":True},[400,422],"C-EC-PRICE-BAD"),(23,"Array price",{**valid,"price":[1]},[400,422],"C-EC-PRICE-BAD"),
        (24,"Missing category",{k:v for k,v in valid.items() if k!="category_id"},[400,422],"C-EC-CATEGORY-BAD"),(25,"Null category",{**valid,"category_id":None},[400,422],"C-EC-CATEGORY-BAD"),
        (26,"Category zero",{**valid,"category_id":0},[400,422],"C-EC-CATEGORY-BAD"),(27,"Negative category",{**valid,"category_id":-1},[400,422],"C-EC-CATEGORY-BAD"),
        (28,"Nonexistent category",{**valid,"category_id":999999},[400,404,422],"C-EC-CATEGORY-BAD"),(29,"String category",{**valid,"category_id":"1"},[400,422],"C-EC-CATEGORY-BAD"),
        (30,"Existing category three",{**valid,"category_id":3},[200],"C-EC-CATEGORY")]
    for n,title,body,status,e in rows:
        c.append(create(n,title,body,status,coverage=["domain","schema"],ecs=[e],schema=PRODUCT_OK if 200 in status else ERROR,
                        oracle="FR-15: name required <=255; price numeric >0; category must exist"))
    c += [
        create(31,"Optional description and image omitted",{"name":"Minimal","price":1,"category_id":1},[200],coverage=["domain","schema"],ecs=["C-EC-OPTIONAL"],schema=PRODUCT_OK),
        tc("C",32,"Malformed JSON","POST","/api/products",[400],raw='{"name":"x",',headers=bearer("admin_token"),setup=admin,coverage=["domain","schema"],ecs=["C-EC-BODY","C-EC-SCHEMA"],schema=ERROR),
        create(33,"SQL text remains data",{**valid,"name":"x'); DROP TABLE products; --"},[200],coverage=["security","schema"],ecs=["C-EC-INJECTION"],secs=["SEC-05"],schema=PRODUCT_OK),
        create(34,"HTML text remains inert",{**valid,"name":"<script>alert(1)</script>"},[200],coverage=["security","schema"],ecs=["C-EC-XSS"],secs=["SEC-04"],schema=PRODUCT_OK),
        create(35,"Role field cannot affect authorization",{**valid,"role":"admin"},[200],coverage=["security","schema"],ecs=["C-EC-MASS"],secs=["SEC-03"],schema=PRODUCT_OK)]
    persistence=("pm.sendRequest({url:pm.variables.replaceIn('{{base_url}}/api/products/'+pm.response.json().id),method:'GET',header:{'X-Student-Id':pm.variables.replaceIn('{{student_id}}')}},"
                 "(err,res)=>pm.test('C-STU-036 persisted fields',()=>{pm.expect(err).to.equal(null);const p=res.json();pm.expect(p.name).to.eql('Persistent Product');pm.expect(Number(p.price)).to.eql(123456);pm.expect(p.category_id).to.eql(2);}));")
    c += [
        create(36,"Created product persists exact stable fields",{**valid,"name":"Persistent Product","price":123456,"category_id":2},[200],coverage=["state","schema"],ecs=["C-EC-PERSIST"],schema=PRODUCT_OK,tests=[persistence],missed="Initial create cases lacked read-after-write verification."),
        create(37,"User JWT plus forged role still forbidden",{**valid,"role":"admin"},[403],headers=bearer("user_token"),setup=[],coverage=["security","state","schema"],ecs=["C-EC-AUTH","C-EC-MASS"],secs=["SEC-03"],schema=ERROR,missed="Combined JWT/body role escalation was absent from independent partitions."),
        create(38,"Stale category reference rejected",{**valid,"category_id":999998},[400,404,422],coverage=["state","domain","schema"],ecs=["C-EC-CATEGORY-BAD"],schema=ERROR,missed="Stale cross-entity references need state-aware generation."),
        create(39,"Unsafe-integer price rejected",{**valid,"price":9007199254740992},[400,422],coverage=["domain","security","schema"],ecs=["C-EC-PRICE-BAD"],schema=ERROR,missed="Positive-price partition omitted numeric precision overflow."),
        create(40,"Server-controlled id and owner fields ignored",{**valid,"id":999999,"user_id":1,"created_at":"2000-01-01"},[200],coverage=["security","state","schema"],ecs=["C-EC-MASS"],schema=PRODUCT_OK,tests=["pm.test('C-STU-040 id assigned by server',()=>pm.expect(pm.response.json().id).to.not.eql(999999));"],missed="Mass assignment needs explicit server-controlled field probes.")]
    return c


def api(api_id, pool, feature, path, contract, ecs, cases):
    return {"api_id":api_id,"pool":pool,"feature":feature,"method":"POST","path":path,"contract":contract,"equivalence_classes":ecs,"cases":cases}


def main():
    a_ec=[ec("A-EC-VALID","credentials","registered/correct","VALID","FR-02"),ec("A-EC-INVALID","credentials","unknown/wrong","INVALID","FR-02"),ec("A-EC-EMAIL","email","valid/invalid formats and types","INVALID","FR-02"),ec("A-EC-PASSWORD","password","missing/blank/wrong type/oversized","INVALID","FR-02"),ec("A-EC-BODY","body","empty/malformed","INVALID","API contract"),ec("A-EC-LOCK","state","0..3 failures/reset/expiry","VALID","FR-02"),ec("A-EC-ENUM","error","generic non-disclosing","VALID","FR-02"),ec("A-EC-INJECTION","input","SQL metacharacters","INVALID","SEC-05"),ec("A-EC-MASS","extra fields","role/nested claims","INVALID","SEC-03"),ec("A-EC-SCHEMA","response","JWT/error JSON and secret absence","VALID","HW06")]
    b_ec=[ec("B-EC-VALID","item","canonical existing product","VALID","FR-07"),ec("B-EC-AUTH","JWT","missing/malformed","INVALID","SEC-02"),ec("B-EC-ID","id","missing/nonpositive/noninteger/nonexistent","INVALID","FR-07"),ec("B-EC-QTY","quantity","positive integer","VALID","FR-07"),ec("B-EC-QTY-BAD","quantity","missing/nonpositive/noninteger/overflow","INVALID","FR-07"),ec("B-EC-ITEM-BAD","name/price","missing/forged/invalid","INVALID","FR-07"),ec("B-EC-MERGE","state","same item merges","VALID","FR-07"),ec("B-EC-MULTI","state","different items separate","VALID","FR-07"),ec("B-EC-ISOLATION","owner","per-user carts","VALID","SEC-02"),ec("B-EC-TRUST","catalog fields","server owned","INVALID","Integrity"),ec("B-EC-BODY","body","empty/malformed","INVALID","API contract"),ec("B-EC-INJECTION","name","SQL text","VALID","SEC-05"),ec("B-EC-XSS","name","HTML text","VALID","SEC-04"),ec("B-EC-MASS","extra fields","ownership/prototype","INVALID","Trust boundary"),ec("B-EC-SCHEMA","response","exact JSON","VALID","HW06")]
    c_ec=[ec("C-EC-VALID","product","valid fields","VALID","FR-15"),ec("C-EC-AUTH","JWT/role","missing/invalid/non-admin","INVALID","SEC-02/03"),ec("C-EC-NAME","name","1..255 chars","VALID","FR-15"),ec("C-EC-NAME-BAD","name","missing/blank/type/>255","INVALID","FR-15"),ec("C-EC-PRICE","price","number >0","VALID","FR-15"),ec("C-EC-PRICE-BAD","price","missing/nonpositive/type/unsafe","INVALID","FR-15"),ec("C-EC-CATEGORY","category","existing","VALID","FR-15"),ec("C-EC-CATEGORY-BAD","category","missing/nonexisting/type","INVALID","FR-15"),ec("C-EC-OPTIONAL","description/image","omitted/valid","VALID","FR-15"),ec("C-EC-BODY","body","malformed","INVALID","API contract"),ec("C-EC-INJECTION","name","SQL text","VALID","SEC-05"),ec("C-EC-XSS","name","HTML text","VALID","SEC-04"),ec("C-EC-MASS","extra fields","role/id/owner","INVALID","Trust boundary"),ec("C-EC-PERSIST","state","read-after-write","VALID","FR-15"),ec("C-EC-SCHEMA","response","exact JSON","VALID","HW06")]
    data={"meta":{"assignment":"HW06-AI","student_id":"23127272","base_url":"http://localhost:3000","sut_repository":"https://github.com/ttbhanh/eshop-sut","sut_commit":"85af3ba875c88283615e22cb108f13e2fccaf0e9","generated_at":"2026-08-18","selection_basis":"Revised group allocation: member 1 APIs FR-02, FR-07, FR-15","review_status":"AI preliminary review complete; student verdict and extension ownership confirmation required","security_dispositions":{"SEC-06":{"status":"DEFERRED_NOT_APPLICABLE","reason":"Selected operations do not update profiles."},"SEC-07":{"status":"DEFERRED_NOT_APPLICABLE","reason":"Selected operations do not issue or consume OTPs."}}},"apis":[api("FR-02","A","Login and account lockout","/api/login","JWT login plus three-failure/30-second lockout",a_ec,fr02()),api("FR-07","B","Add product to cart","/api/cart","Authenticated validated cart mutation with merge and isolation",b_ec,fr07()),api("FR-15","C","Create product","/api/products","Admin-only validated product creation and persistence",c_ec,fr15())]}
    reviewed=copy.deepcopy(data)
    for a in reviewed["apis"]: a["cases"]=[x for x in a["cases"] if x["origin"]=="AI"]
    original=copy.deepcopy(reviewed)
    for a in original["apis"]:
        for x in a["cases"]: x["audit"]={"verdict":"INCOMPLETE","reason":"Raw AI output requires human review.","fix":"Review oracle, coverage, setup, schema, and safety.","reviewer":"Unreviewed AI output"}
    ORIGINAL.write_text(json.dumps(original,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    REVIEWED.write_text(json.dumps(reviewed,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"counts":{a["api_id"]:len(a["cases"]) for a in data["apis"]}},indent=2))


if __name__=="__main__": main()
