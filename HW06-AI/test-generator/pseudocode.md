# AI-Driven EShop API Test Generator - Pseudocode

```text
INPUT:
  assignment, requirements, api_spec, source_tree
  student_selected_apis[Pool A, Pool B, Pool C]
  student_id, base_url, sut_commit

REQUIRE exactly one selected API from each pool
REQUIRE student confirmation that combination is unique in group

FOR EACH selected_api:
  contract <- reconcile(requirements, api_spec)
  implementation_notes <- inspect(source, schema, middleware, seed data)
  variables <- identify_inputs_outputs_preconditions_side_effects(contract)

  equivalence_classes <- empty set
  FOR EACH variable:
    equivalence_classes += partition_valid_invalid(variable)
    equivalence_classes += boundary_classes(variable)
  END FOR

  state_model <- derive_states_and_allowed_transitions(contract)
  security_model <- map_SEC_01_to_SEC_07(contract, selected_api)
  response_schemas <- derive_exact_success_and_error_schemas(contract)

  ai_cases <- empty list
  ai_cases += select_minimum_domain_representatives(equivalence_classes)
  ai_cases += generate_boundary_cases(equivalence_classes)
  ai_cases += generate_state_cases(state_model)
  ai_cases += generate_security_cases(security_model)
  ai_cases += generate_schema_cases(response_schemas)
  WHILE count(ai_cases) < 35:
    ai_cases += generate_nonduplicate_cross_field_or_sequence_case()
  END WHILE

  FOR EACH case IN ai_cases:
    verdict, reasoning, fix <- HUMAN_REVIEW(case, contract, source)
    save_original_and_reviewed_case(case, verdict, reasoning, fix)
  END FOR

  missed_risks <- HUMAN_IDENTIFY_GAPS(ai_cases, contract, source)
  student_cases <- create_at_least_5_new_cases(missed_risks)
  FOR EACH case IN student_cases:
    record_why_ai_missed(case)
  END FOR

  REQUIRE every_equivalence_class_is_covered()
  REQUIRE domain_state_security_schema_are_covered()
  REQUIRE at_least_one_exact_schema_assertion()
END FOR

REQUIRE suite_maps_SEC_01_through_SEC_07()
VALIDATE catalog_structure_counts_traceability()
collection <- BUILD_POSTMAN_COLLECTION(reviewed_cases)
ADD collection_pre_request_header("X-Student-Id", student_id)
RUN Newman(collection, environment, iteration_data)
SAVE genuine_cli_json_html_reports()
COMPARE expected_vs_actual()
TRIAGE failures_as(test_defect, data_defect, environment_defect, sut_bug)
HUMAN_CAPTURE screenshots_and_publish_confirmed_issues()
EXPORT markdown_excel_pdf_ci_summary_and_audit()
```

The generator never invents API selection, review verdicts, execution evidence, screenshots, issue URLs, or CI run URLs.
