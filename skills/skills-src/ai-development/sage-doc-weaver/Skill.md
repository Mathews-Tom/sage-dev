---
name: Sage Doc Weaver
description: Generate synchronized documentation - API references, mermaid diagrams, READMEs, and SOPs directly from code and specification files.
version: 1.0.0
dependencies: python>=3.12, mermaid-cli
---

# Sage Doc Weaver

Living documentation at your fingertips.

## Purpose

Auto-generate API references, architecture diagrams, README content, and Standard Operating Procedures (SOPs) from existing code and specifications. Keep documentation synchronized with code changes.

## When to Use

- Maintaining API documentation
- Creating architecture diagrams
- Generating README files
- Writing Standard Operating Procedures
- Documenting workflows and processes
- Keeping docs in sync with code

## Core Workflow

### 1. API Reference Generation

Extract API documentation from code annotations:

```python
from fastapi import FastAPI, APIRouter
from pydantic import BaseModel, Field
import ast
import inspect

def generate_api_reference(app: FastAPI) -> str:
    """Generate markdown API reference from FastAPI app."""
    docs = []

    for route in app.routes:
        if hasattr(route, 'endpoint'):
            func = route.endpoint
            docs.append(f"## {route.methods} {route.path}\n")

            # Extract docstring
            if func.__doc__:
                docs.append(f"{func.__doc__}\n")

            # Extract parameters
            sig = inspect.signature(func)
            if sig.parameters:
                docs.append("### Parameters\n")
                for param_name, param in sig.parameters.items():
                    if param_name not in ('request', 'response'):
                        docs.append(f"- **{param_name}**: {param.annotation}\n")

            # Extract request body schema
            for param in sig.parameters.values():
                if isinstance(param.annotation, type) and issubclass(param.annotation, BaseModel):
                    docs.append("### Request Body\n")
                    docs.append("```json\n")
                    docs.append(param.annotation.schema_json(indent=2))
                    docs.append("\n```\n")

            docs.append("\n---\n\n")

    return "".join(docs)
```

### 2. Mermaid Diagram Generation

Create sequence diagrams from code flow:

```python
def generate_sequence_diagram(function_calls: list[tuple[str, str]]) -> str:
    """Generate mermaid sequence diagram from function calls."""
    diagram = ["```mermaid", "sequenceDiagram"]

    actors = set()
    for caller, callee in function_calls:
        actors.add(caller)
        actors.add(callee)

    # Add participants
    for actor in sorted(actors):
        diagram.append(f"    participant {actor}")

    # Add interactions
    for caller, callee in function_calls:
        diagram.append(f"    {caller}->>+{callee}: call")
        diagram.append(f"    {callee}-->>-{caller}: return")

    diagram.append("```")
    return "\n".join(diagram)

def generate_class_diagram(classes: list[dict]) -> str:
    """Generate mermaid class diagram."""
    diagram = ["```mermaid", "classDiagram"]

    for cls in classes:
        diagram.append(f"    class {cls['name']} {{")

        # Add attributes
        for attr in cls.get('attributes', []):
            diagram.append(f"        +{attr['type']} {attr['name']}")

        # Add methods
        for method in cls.get('methods', []):
            params = ', '.join(method.get('params', []))
            diagram.append(f"        +{method['name']}({params}) {method.get('return_type', '')}")

        diagram.append("    }")

        # Add relationships
        for rel in cls.get('relationships', []):
            diagram.append(f"    {cls['name']} {rel['type']} {rel['target']}")

    diagram.append("```")
    return "\n".join(diagram)

def generate_flowchart(steps: list[dict]) -> str:
    """Generate mermaid flowchart from workflow steps."""
    diagram = ["```mermaid", "flowchart TD"]

    for i, step in enumerate(steps):
        step_id = f"step{i}"
        step_type = step.get('type', 'process')

        if step_type == 'start':
            diagram.append(f"    {step_id}([{step['text']}])")
        elif step_type == 'end':
            diagram.append(f"    {step_id}([{step['text']}])")
        elif step_type == 'decision':
            diagram.append(f"    {step_id}{{{step['text']}}}")
        else:
            diagram.append(f"    {step_id}[{step['text']}]")

        # Add connections
        if 'next' in step:
            for next_step in step['next']:
                label = next_step.get('label', '')
                target = f"step{next_step['id']}"
                if label:
                    diagram.append(f"    {step_id} -->|{label}| {target}")
                else:
                    diagram.append(f"    {step_id} --> {target}")

    diagram.append("```")
    return "\n".join(diagram)
```

### 3. README Generation

Generate comprehensive README from project structure:

```python
def generate_readme(project_info: dict) -> str:
    """Generate README.md from project information."""
    sections = []

    # Title and badges
    sections.append(f"# {project_info['name']}\n")
    if 'tagline' in project_info:
        sections.append(f"**{project_info['tagline']}**\n")

    if 'badges' in project_info:
        sections.append("\n".join(project_info['badges']) + "\n")

    # Overview
    if 'description' in project_info:
        sections.append("## Overview\n")
        sections.append(f"{project_info['description']}\n")

    # Features
    if 'features' in project_info:
        sections.append("## Features\n")
        for feature in project_info['features']:
            sections.append(f"- {feature}")
        sections.append("")

    # Installation
    if 'install_steps' in project_info:
        sections.append("## Installation\n")
        for step in project_info['install_steps']:
            sections.append(f"{step}\n")

    # Quick Start
    if 'quick_start' in project_info:
        sections.append("## Quick Start\n")
        sections.append("```python")
        sections.append(project_info['quick_start'])
        sections.append("```\n")

    # Documentation
    if 'docs_url' in project_info:
        sections.append("## Documentation\n")
        sections.append(f"Full documentation available at [{project_info['docs_url']}]({project_info['docs_url']})\n")

    # API Reference
    if 'api_reference' in project_info:
        sections.append("## API Reference\n")
        sections.append(project_info['api_reference'])

    # Examples
    if 'examples' in project_info:
        sections.append("## Examples\n")
        for example in project_info['examples']:
            sections.append(f"### {example['title']}\n")
            sections.append(f"{example['description']}\n")
            sections.append(f"```{example.get('language', 'python')}")
            sections.append(example['code'])
            sections.append("```\n")

    # Contributing
    sections.append("## Contributing\n")
    sections.append("Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.\n")

    # License
    if 'license' in project_info:
        sections.append("## License\n")
        sections.append(f"This project is licensed under the {project_info['license']} License.\n")

    return "\n".join(sections)
```

### 4. SOP Generation

Create Standard Operating Procedures:

```python
def generate_sop(procedure_info: dict) -> str:
    """Generate SOP markdown from procedure information."""
    sop = []

    # Header
    sop.append(f"# {procedure_info['title']}\n")
    sop.append(f"**Document ID:** {procedure_info.get('doc_id', 'SOP-XXX')}")
    sop.append(f"**Version:** {procedure_info.get('version', '1.0.0')}")
    sop.append(f"**Last Updated:** {procedure_info.get('last_updated', 'YYYY-MM-DD')}")
    sop.append(f"**Owner:** {procedure_info.get('owner', 'Team Name')}\n")

    # Purpose
    sop.append("## Purpose\n")
    sop.append(f"{procedure_info['purpose']}\n")

    # Scope
    if 'scope' in procedure_info:
        sop.append("## Scope\n")
        sop.append(f"{procedure_info['scope']}\n")

    # Prerequisites
    if 'prerequisites' in procedure_info:
        sop.append("## Prerequisites\n")
        for prereq in procedure_info['prerequisites']:
            sop.append(f"- {prereq}")
        sop.append("")

    # Procedure Steps
    sop.append("## Procedure\n")
    for i, step in enumerate(procedure_info['steps'], 1):
        sop.append(f"### Step {i}: {step['title']}\n")
        sop.append(f"{step['description']}\n")

        if 'substeps' in step:
            for j, substep in enumerate(step['substeps'], 1):
                sop.append(f"{i}.{j}. {substep}")
            sop.append("")

        if 'code' in step:
            sop.append(f"```{step.get('language', 'bash')}")
            sop.append(step['code'])
            sop.append("```\n")

        if 'warning' in step:
            sop.append(f"⚠️ **Warning:** {step['warning']}\n")

        if 'note' in step:
            sop.append(f"📝 **Note:** {step['note']}\n")

    # Troubleshooting
    if 'troubleshooting' in procedure_info:
        sop.append("## Troubleshooting\n")
        for issue in procedure_info['troubleshooting']:
            sop.append(f"### {issue['problem']}\n")
            sop.append(f"**Symptoms:** {issue['symptoms']}\n")
            sop.append(f"**Solution:** {issue['solution']}\n")

    # References
    if 'references' in procedure_info:
        sop.append("## References\n")
        for ref in procedure_info['references']:
            sop.append(f"- [{ref['title']}]({ref['url']})")
        sop.append("")

    # Revision History
    if 'revisions' in procedure_info:
        sop.append("## Revision History\n")
        sop.append("| Version | Date | Author | Changes |")
        sop.append("|---------|------|--------|---------|")
        for rev in procedure_info['revisions']:
            sop.append(f"| {rev['version']} | {rev['date']} | {rev['author']} | {rev['changes']} |")
        sop.append("")

    return "\n".join(sop)
```

### 5. Docstring Generation

Generate Google-style docstrings for code:

```python
import ast
import inspect

def generate_docstring(func_def: ast.FunctionDef) -> str:
    """Generate Google-style docstring for function."""
    lines = []

    # Summary (to be filled by user or LLM)
    lines.append('    """[Brief description of function]')
    lines.append("")

    # Args section
    if func_def.args.args:
        lines.append("    Args:")
        for arg in func_def.args.args:
            if arg.arg != 'self':
                arg_type = ast.unparse(arg.annotation) if arg.annotation else "Any"
                lines.append(f"        {arg.arg} ({arg_type}): [Description]")
        lines.append("")

    # Returns section
    if func_def.returns:
        return_type = ast.unparse(func_def.returns)
        lines.append("    Returns:")
        lines.append(f"        {return_type}: [Description of return value]")
        lines.append("")

    # Raises section (infer from function body)
    raises = set()
    for node in ast.walk(func_def):
        if isinstance(node, ast.Raise) and isinstance(node.exc, ast.Call):
            if isinstance(node.exc.func, ast.Name):
                raises.add(node.exc.func.id)

    if raises:
        lines.append("    Raises:")
        for exc in sorted(raises):
            lines.append(f"        {exc}: [Description of when this is raised]")
        lines.append("")

    # Examples section
    lines.append("    Examples:")
    lines.append("        >>> [example usage]")
    lines.append("        [expected output]")
    lines.append('    """')

    return "\n".join(lines)
```

### 6. Architecture Documentation

Generate architecture decision records (ADRs):

```python
def generate_adr(decision_info: dict) -> str:
    """Generate Architecture Decision Record."""
    adr = []

    # Header
    adr_num = decision_info.get('number', 'XXX')
    adr.append(f"# ADR-{adr_num}: {decision_info['title']}\n")
    adr.append(f"**Date:** {decision_info.get('date', 'YYYY-MM-DD')}")
    adr.append(f"**Status:** {decision_info.get('status', 'Proposed')}")
    adr.append(f"**Deciders:** {', '.join(decision_info.get('deciders', ['Team']))}\n")

    # Context
    adr.append("## Context\n")
    adr.append(f"{decision_info['context']}\n")

    # Decision
    adr.append("## Decision\n")
    adr.append(f"{decision_info['decision']}\n")

    # Consequences
    adr.append("## Consequences\n")

    if 'positive' in decision_info:
        adr.append("### Positive\n")
        for item in decision_info['positive']:
            adr.append(f"- {item}")
        adr.append("")

    if 'negative' in decision_info:
        adr.append("### Negative\n")
        for item in decision_info['negative']:
            adr.append(f"- {item}")
        adr.append("")

    if 'neutral' in decision_info:
        adr.append("### Neutral\n")
        for item in decision_info['neutral']:
            adr.append(f"- {item}")
        adr.append("")

    # Alternatives Considered
    if 'alternatives' in decision_info:
        adr.append("## Alternatives Considered\n")
        for alt in decision_info['alternatives']:
            adr.append(f"### {alt['name']}\n")
            adr.append(f"{alt['description']}\n")
            adr.append(f"**Rejected because:** {alt['reason']}\n")

    # References
    if 'references' in decision_info:
        adr.append("## References\n")
        for ref in decision_info['references']:
            adr.append(f"- {ref}")
        adr.append("")

    return "\n".join(adr)
```

### 7. Changelog Generation

Generate CHANGELOG.md from git commits:

```python
import subprocess
from datetime import datetime

def generate_changelog() -> str:
    """Generate changelog from git commits."""
    # Get git log
    result = subprocess.run(
        ['git', 'log', '--pretty=format:%H|%s|%an|%ad', '--date=short'],
        capture_output=True,
        text=True
    )

    commits = []
    for line in result.stdout.split('\n'):
        if line:
            hash, subject, author, date = line.split('|')
            commits.append({
                'hash': hash[:7],
                'subject': subject,
                'author': author,
                'date': date
            })

    # Group by version/date
    changelog = ["# Changelog\n"]
    changelog.append("All notable changes to this project will be documented in this file.\n")
    changelog.append("The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n")

    # Group commits by type
    by_type = {
        'Added': [],
        'Changed': [],
        'Fixed': [],
        'Deprecated': [],
        'Removed': [],
        'Security': []
    }

    for commit in commits:
        subject = commit['subject']
        if subject.startswith('feat'):
            by_type['Added'].append(commit)
        elif subject.startswith('fix'):
            by_type['Fixed'].append(commit)
        elif subject.startswith('refactor') or subject.startswith('chore'):
            by_type['Changed'].append(commit)
        elif subject.startswith('security'):
            by_type['Security'].append(commit)

    # Generate sections
    changelog.append("## [Unreleased]\n")
    for type_name, type_commits in by_type.items():
        if type_commits:
            changelog.append(f"### {type_name}\n")
            for commit in type_commits:
                msg = commit['subject'].split(':', 1)[-1].strip()
                changelog.append(f"- {msg} ([{commit['hash']}])")
            changelog.append("")

    return "\n".join(changelog)
```

### 8. CI/CD Documentation

Generate documentation for CI/CD workflows:

```python
def document_github_workflow(workflow_file: str) -> str:
    """Generate documentation for GitHub Actions workflow."""
    import yaml

    with open(workflow_file) as f:
        workflow = yaml.safe_load(f)

    docs = []
    docs.append(f"# {workflow['name']}\n")

    # Triggers
    docs.append("## Triggers\n")
    if 'on' in workflow:
        triggers = workflow['on']
        if isinstance(triggers, dict):
            for event, config in triggers.items():
                docs.append(f"- **{event}**")
                if isinstance(config, dict) and 'branches' in config:
                    docs.append(f" (branches: {', '.join(config['branches'])})")
                docs.append("")
        elif isinstance(triggers, list):
            for event in triggers:
                docs.append(f"- {event}")
        docs.append("")

    # Jobs
    docs.append("## Jobs\n")
    for job_name, job_config in workflow.get('jobs', {}).items():
        docs.append(f"### {job_name}\n")
        docs.append(f"**Runs on:** {job_config.get('runs-on', 'unknown')}\n")

        if 'steps' in job_config:
            docs.append("**Steps:**\n")
            for i, step in enumerate(job_config['steps'], 1):
                step_name = step.get('name', f'Step {i}')
                docs.append(f"{i}. {step_name}")
            docs.append("")

    return "\n".join(docs)
```

## Best Practices

1. **Auto-Generation**: Regenerate docs on code changes
2. **Sync**: Keep docs in sync with code via CI/CD
3. **Templates**: Use consistent templates across documentation
4. **Diagrams**: Include visual representations where helpful
5. **Examples**: Provide real, working code examples
6. **Versioning**: Version documentation alongside code
7. **Search**: Make documentation searchable
8. **Links**: Cross-link related documentation

## Quality Checklist

- [ ] API reference complete and accurate
- [ ] Architecture diagrams included
- [ ] README covers installation and quick start
- [ ] SOPs for critical procedures
- [ ] Docstrings on all public functions
- [ ] Examples are tested and working
- [ ] Changelog maintained
- [ ] CI/CD integration for doc updates
- [ ] No broken links
- [ ] Proper formatting and structure
