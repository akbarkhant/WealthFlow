# Implementation Plan - WealthFlow Production Release Audit & Documentation

Perform a comprehensive architectural audit of the WealthFlow (MBMS) full-stack application and generate two production-grade artifacts: `plan3.md` (Release Roadmap) and `PROJECT_MANIFEST.md` (System Manifest).

## User Review Required

During the initial audit of the codebase, several critical production blockers and architectural inconsistencies were identified. These must be highlighted in the release roadmap and resolved prior to launch:

> [!IMPORTANT]
> **Database Schema Mismatches**:
> - The file `backend/db/schema.sql` does not include columns used heavily by the repositories (e.g., `balance` and `avatar_url` on `users`, and `name`, `period`, `status`, `start_date`, `end_date`, `alert_threshold` on `budgets`).
> - The `accounts` and `account_snapshots` tables are queried in `accounts.repository.js` but completely missing from `schema.sql`.
> - The `goals` and `goal_contributions` tables are queried in `goals.repository.js` but missing from `schema.sql`.

> [!WARNING]
> **Chat Controller ReferenceError**:
> - In `backend/src/modules/ai/ai.controller.js` (line 81), the chat endpoint has a direct `ReferenceError`: it attempts to log `budgets` instead of `budgetResult` (`console.log('BUDGETS:', budgets);`). This causes the chat route to crash on invocation.

> [!WARNING]
> **Ollama Configuration Hardcoding**:
> - In `backend/src/modules/ai/ai.engine.js`, the Ollama API URL is hardcoded to `http://localhost:11434/api/generate` and the model is hardcoded to `llama3.2:1b`. This prevents containerized deployments using Docker Compose where the backend must connect via `http://ollama:11434` or configured through environment variables.

> [!NOTE]
> **Dual AI Model Stack**:
> - The system features a hybrid AI architecture: `ai.receipt.js` and `ai.report.js` leverage the local Ollama instance (`ai.engine.js`), while the chat, analyze, and suggest endpoints in `ai.service.js` use the cloud Gemini API via the `@google/genai` SDK.

---

## Proposed Documents

We will generate two comprehensive Markdown files at the root of the workspace:

### 1. `[NEW] plan3.md` (Roadmap)
- **Executive Summary**: Module completion percentages, audit findings, and production readiness scores.
- **Ready/Readiness Assessment**: Comprehensive Strengths, Weaknesses, Risks, and Blockers for each module.
- **Phase 1-6 Plan**: Structured steps covering Security Hardening, Financial Integrity, Database Optimizations, Test Coverage targets (unit, integration, load), DevOps/Deployment infrastructure, and Release Checklists (RC-1, RC-2, Launch Day, and Rollback).
- **Timeline**: 6-week roadmap with estimated effort and specific deliverables.

### 2. `[NEW] PROJECT_MANIFEST.md` (System Manifest)
- **System Overview & Folder Structure**: Technical architecture, module boundaries, folder mapping (ASCII tree), and directory purposes.
- **Database Architecture**: Full documentation of tables, constraints, relationships, indexes, foreign keys, and integrity rules.
- **Financial Ledger Engine**: Sequential request lifecycles (sequence descriptions), multi-currency conversion validation, balance updates, atomicity guarantees, and ledger auditing.
- **Request Lifecycle**: Step-by-step routing flow from client to DB and back.
- **Security & AI Architecture**: JWT authentication flow, password policies, session security, threat model, LLM context generation, receipt/budget pipelines, and jailbreak guardrails.
- **API Reference**: Method, Path, Body, Validation, and Response details for all routes.
- **Docker/Infrastructure & Future Roadmap**: Deployment setups, persistence volumes, and feature roadmap (V1, V2, V3).

---

## Verification Plan

### Manual Verification
- Verify that `plan3.md` and `PROJECT_MANIFEST.md` are written to the workspace root (`e:/Git Projects/MBMS`).
- Check that the Markdown syntax is fully compliant and properly formatted.
- Ensure all technical aspects observed in the audit (including database tables, columns, indexes, and middlewares) are accurately detailed.
