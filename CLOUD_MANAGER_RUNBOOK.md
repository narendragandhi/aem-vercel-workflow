# Cloud Manager Runbook

## Scope
This runbook describes how to build, deploy, and validate AEMFlow on AEM as a Cloud Service using Cloud Manager and the local AEM SDK.

## Prerequisites
- Cloud Manager program with AEM as a Cloud Service enabled.
- AEM SDK author and publish running locally for integration tests.
- Service user and ACLs created by repo init config in `ui.config`.

## Build And Deploy
1. Validate locally.
   - `mvn -B -ntp -pl core -am test`
   - `mvn -B -ntp -pl all -am package`
2. Commit and push changes to the Cloud Manager repository.
3. Run the Cloud Manager pipeline.
4. Verify installation in author.
   - Confirm `/apps/aem-vercel-workflow` exists.
   - Confirm OSGi config `org.apache.sling.jcr.repoinit.RepositoryInitializer~aemflow.cfg.json` is installed.

## RBAC And Service User
- Groups created by repo init.
  - `aemflow-admin` has read/write for workflow, audit, and AI action storage under `/var`.
  - `aemflow-author` has read-only access to the same paths.
- Service user created by repo init.
  - `aem-vercel-workflow-service` is used by backend services.

## Validation Checks
1. Author API responds.
   - `GET /bin/workflows`
2. Audit log path created.
   - `/var/audit/aemflow`
3. Workflow definitions path created.
   - `/var/workflows/definitions`
4. Clientlib published.
   - `/apps/aem-vercel-workflow/clientlibs/workflow-builder`

## Rollback
- Use Cloud Manager pipeline rollback to revert to the last successful build.

