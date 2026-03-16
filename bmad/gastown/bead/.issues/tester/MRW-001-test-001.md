---
id: MRW-001-test-001
workflow_id: MRW-001
type: test
agent: tester
status: completed
priority: low
depends_on: [MRW-001-spec-001, MRW-001-impl-001]
blocks: [MRW-001-review-001]
---

# Machine-Readable Web Tests

## Reference
- Specification: bmad/gastown/bead/.issues/docs/MRW-001-spec-001.md
- Implementation: bmad/gastown/bead/.issues/coder/MRW-001-impl-001.md

## Test Coverage

### Unit Tests

1. **StructuredContentAPITest**
   - `testGetContent()`
   - `testSearchContent()`
   - `testPagination()`
   - `testRateLimiting()`

2. **SchemaMarkupServiceTest**
   - `testGenerateProductSchema()`
   - `testGenerateArticleSchema()`
   - `testSchemaValidation()`
   - `testCustomSchemas()`

3. **AgentSitemapGeneratorTest**
   - `testGenerateSitemap()`
   - `testIncrementalUpdate()`
   - `testSitemapIndex()`

4. **ContentEnrichmentServiceTest**
   - `testEntityExtraction()`
   - `testRelationshipMapping()`
   - `testAutoTagging()`

5. **AgentAnalyticsServiceTest**
   - `testTrackVisit()`
   - `testQueryLog()`
   - `testBehaviorAnalysis()`

### Integration Tests

1. **AgentAPIIntegrationTest**
   - End-to-end content retrieval
   - Schema markup validation
   - Sitemap generation

## Test Files

- `core/src/test/java/com/aemflow/agentic/*Test.java`
- `api/src/test/java/com/aemflow/agentic/*Test.java`

## Quality Criteria

- [ ] 80%+ code coverage
- [ ] Schema.org validation
- [ ] API contracts tested
