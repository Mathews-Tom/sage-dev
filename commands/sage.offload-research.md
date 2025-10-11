# Offload Research to Sub-Agent

You are tasked with delegating extended research tasks to an isolated sub-agent, preserving the main conversation context.

## Input Parameters

The user will provide:
- **Topic:** Research topic or question (required)
- **Output File:** (Optional) Custom output path. Default: `.sage/agent/research/<timestamp>-research.md`

## Instructions

### Step 1: Parse Input

1. Extract the research topic from user input
2. Check if custom output file path provided
3. If no custom path, generate default:
   - Format: `.sage/agent/research/YYYYMMDD-HHMMSS-research.md`
   - Example: `.sage/agent/research/20251011-062000-research.md`
4. Slugify topic for use in filename if needed:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Limit to 30 characters
   - Example: "Context Engineering Best Practices" → "context-engineering-best-pr"

### Step 2: Ensure Directory Exists

1. Check if `.sage/agent/research/` directory exists
2. If not, create it:
   ```bash
   mkdir -p .sage/agent/research
   ```
3. Verify directory permissions (0755)

### Step 3: Prepare Sub-Agent Task

Create a detailed task prompt for the sub-agent:

```markdown
Research Task: {{TOPIC}}

Conduct comprehensive research on the specified topic and deliver a structured markdown report.

## Deliverables

Your research output should include:

### 1. Executive Summary
- Brief overview of the topic (2-3 paragraphs)
- Key findings (3-5 bullet points)
- Main takeaways

### 2. Background and Context
- What is this topic?
- Why is it relevant?
- Current state of practice

### 3. Detailed Findings

#### Finding 1: {{ASPECT_1}}
- Description
- Evidence or examples
- Implications

#### Finding 2: {{ASPECT_2}}
- Description
- Evidence or examples
- Implications

#### Finding 3: {{ASPECT_3}}
- Description
- Evidence or examples
- Implications

### 4. Best Practices
- Recommended approaches (numbered list)
- Dos and Don'ts
- Common pitfalls to avoid

### 5. Technical Considerations
- Implementation details
- Trade-offs and decisions
- Performance implications
- Security considerations

### 6. Case Studies or Examples
- Real-world examples
- Code snippets or configurations
- Lessons learned

### 7. References and Resources
- Internal documentation links
- External articles, papers, or documentation
- Tools or libraries mentioned
- Related topics for further research

### 8. Recommendations
- Immediate next steps
- Short-term actions (1-2 weeks)
- Long-term considerations (1+ months)
- Open questions requiring further investigation

### 9. Appendix (if needed)
- Detailed technical data
- Extended code examples
- Glossary of terms

## Research Guidelines

- Be thorough but concise
- Cite sources where possible
- Include practical examples
- Focus on actionable insights
- Highlight trade-offs and limitations
- Use markdown formatting consistently
- Include code examples in appropriate language blocks
- Cross-reference related concepts

## Output Format

Save your complete research report to:
{{OUTPUT_FILE_PATH}}

The report should be in Markdown format, well-structured, and ready for immediate use by AI agents or human developers.
```

### Step 4: Spawn Sub-Agent

1. Use the Task tool with `general-purpose` agent type
2. Pass the prepared research prompt
3. Specify the output file path in the prompt
4. Wait for sub-agent completion
5. Inform user: "Research task delegated to sub-agent. Working in background..."

### Step 5: Handle Sub-Agent Response

When sub-agent completes:

1. Verify output file was created at expected path
2. Read the first few lines to confirm valid markdown
3. Get file size and line count
4. Report to user:
   ```
   Research completed: {{TOPIC}}

   Report saved to: {{OUTPUT_FILE_PATH}}
   - Size: {{FILE_SIZE}}
   - Lines: {{LINE_COUNT}}
   - Sections: {{SECTION_COUNT}}

   You can review the research report using:
   /read {{OUTPUT_FILE_PATH}}
   ```

### Step 6: Update Index (Optional)

If `.sage/agent/research/` is part of the documentation system:

1. Call `/sage.update-index` to regenerate README.md
2. Inform user: "Documentation index updated"

## Example Interactions

### Example 1: Default Output Path

**User Input:** `/offload-research "Context Engineering Best Practices for LLM Agents"`

**Your Actions:**

1. Parse:
   - Topic: "Context Engineering Best Practices for LLM Agents"
   - Output file: Not specified, use default
2. Generate timestamp: `20251011-062500`
3. Default path: `.sage/agent/research/20251011-062500-research.md`
4. Ensure directory: `.sage/agent/research/` exists
5. Prepare sub-agent prompt with topic and deliverables
6. Spawn sub-agent using Task tool:
   ```
   Task(
     subagent_type="general-purpose",
     description="Research context engineering practices",
     prompt=research_prompt_with_deliverables
   )
   ```
7. Inform user: "Research task delegated to sub-agent. Working in background..."
8. Wait for completion
9. Verify file created: `.sage/agent/research/20251011-062500-research.md`
10. Check stats: 15KB, 450 lines, 9 sections
11. Report:
    ```
    Research completed: Context Engineering Best Practices for LLM Agents

    Report saved to: .sage/agent/research/20251011-062500-research.md
    - Size: 15KB
    - Lines: 450
    - Sections: 9

    You can review the research report using:
    /read .sage/agent/research/20251011-062500-research.md
    ```
12. Call `/sage.update-index`
13. Inform: "Documentation index updated"

### Example 2: Custom Output Path

**User Input:** `/offload-research "Parallel Execution Patterns" docs/research/parallel-patterns.md`

**Your Actions:**

1. Parse:
   - Topic: "Parallel Execution Patterns"
   - Output file: `docs/research/parallel-patterns.md`
2. Verify: Output path is not in `.sage/agent/research/` (custom location)
3. Ensure directory: `docs/research/` exists (create if needed)
4. Prepare sub-agent prompt with topic and custom output path
5. Spawn sub-agent
6. Inform user: "Research task delegated to sub-agent. Working in background..."
7. Wait for completion
8. Verify file: `docs/research/parallel-patterns.md`
9. Report results with file location
10. Skip `/sage.update-index` (custom path outside .sage/agent/)

## Task Prompt Template

When spawning sub-agent, use this exact template:

```markdown
# Research Task: {{TOPIC}}

You are conducting research on "{{TOPIC}}" to provide comprehensive, actionable insights.

## Instructions

1. Research the topic thoroughly
2. Structure your findings using the format below
3. Save the complete report to: {{OUTPUT_PATH}}

## Required Report Structure

# Research Report: {{TOPIC}}

**Date:** {{CURRENT_DATE}}
**Researcher:** AI Research Agent
**Status:** Complete

---

## Executive Summary

{{2-3 paragraph overview}}

**Key Findings:**
- {{Finding 1}}
- {{Finding 2}}
- {{Finding 3}}
- {{Finding 4}}
- {{Finding 5}}

**Main Takeaways:**
{{Critical insights in 2-3 sentences}}

---

## Background and Context

{{Detailed background}}

---

## Detailed Findings

### Finding 1: {{Aspect}}

{{Description, evidence, implications}}

### Finding 2: {{Aspect}}

{{Description, evidence, implications}}

### Finding 3: {{Aspect}}

{{Description, evidence, implications}}

---

## Best Practices

1. {{Practice 1}}
2. {{Practice 2}}
3. {{Practice 3}}
...

**Dos:**
- {{Do 1}}
- {{Do 2}}

**Don'ts:**
- {{Don't 1}}
- {{Don't 2}}

**Common Pitfalls:**
- {{Pitfall 1}}
- {{Pitfall 2}}

---

## Technical Considerations

### Implementation

{{Technical details}}

### Trade-offs

{{Decisions and trade-offs}}

### Performance

{{Performance implications}}

### Security

{{Security considerations}}

---

## Case Studies

### Example 1: {{Case}}

{{Description, code, lessons}}

### Example 2: {{Case}}

{{Description, code, lessons}}

---

## References

### Internal Documentation
- [{{Doc 1}}]({{path}})
- [{{Doc 2}}]({{path}})

### External Resources
- [{{Resource 1}}]({{URL}})
- [{{Resource 2}}]({{URL}})

### Related Topics
- {{Topic 1}}
- {{Topic 2}}

---

## Recommendations

### Immediate Next Steps (Now)
1. {{Action 1}}
2. {{Action 2}}

### Short-term Actions (1-2 weeks)
1. {{Action 1}}
2. {{Action 2}}

### Long-term Considerations (1+ months)
1. {{Action 1}}
2. {{Action 2}}

### Open Questions
- {{Question 1}}
- {{Question 2}}

---

## Appendix

{{Extended technical details, code examples, glossary}}

---

*Generated: {{TIMESTAMP}}*
*Version: 1.0*

## Output Instructions

Save this complete report to: {{OUTPUT_PATH}}

Use the Write tool to create the file with the full content above.
Ensure all sections are populated with relevant, researched information.
```

## Error Handling

- If topic empty, display: "Error: Research topic required"
- If output path invalid, display: "Error: Invalid output path: {{PATH}}"
- If directory creation fails, display: "Error: Cannot create directory: {{DIR}}"
- If sub-agent fails, display: "Research failed. Error: {{ERROR_MESSAGE}}"
- If output file not created, display: "Warning: Research completed but output file not found at {{PATH}}"
- If sub-agent timeout (> 10 minutes), display: "Research taking longer than expected. Sub-agent still working..."

## Important Notes

- ALWAYS use Task tool with `general-purpose` subagent_type
- ALWAYS specify clear deliverables in sub-agent prompt
- ALWAYS provide output file path in prompt
- ALWAYS verify file created after sub-agent completes
- Default timestamp format: YYYYMMDD-HHMMSS
- Ensure `.sage/agent/research/` directory exists
- Sub-agent runs in isolated context (doesn't affect main conversation)
- Main conversation continues immediately after delegation
- User can continue working while research runs in background
- For custom paths outside `.sage/agent/`, skip `/sage.update-index`
- For paths inside `.sage/agent/research/`, call `/sage.update-index`
- Include comprehensive prompt template for consistent research quality
- Verify markdown formatting in output file
- File should be immediately usable by other agents
- Research report should be 200-500 lines typically
- Include practical, actionable insights (not just theory)
- Cross-reference with existing sage-dev documentation when relevant
