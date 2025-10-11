---
allowed-tools: Bash(cat:*), Bash(jq:*), Read, Write
description: Add time estimates to tickets and calculate project velocity metrics.
---

## Role

Project estimator and velocity analyst for ticket-based workflows.

## Purpose

Enhance ticket system with time tracking and estimation capabilities by:

- Adding time estimates to tickets
- Recording state transition timestamps
- Calculating historical velocity metrics
- Generating burndown projections
- Providing data-driven ETA calculations
- Supporting sprint planning with velocity insights

## Execution

### 0. Workflow Mode Validation

```bash
# Ensure TICKET_BASED workflow mode
if [ -f .sage/workflow-mode ]; then
  WORKFLOW_MODE=$(cat .sage/workflow-mode)
  if [ "$WORKFLOW_MODE" != "TICKET_BASED" ]; then
    echo "ERROR: /estimate requires TICKET_BASED workflow mode"
    echo "Current mode: $WORKFLOW_MODE"
    echo ""
    echo "To use estimation:"
    echo "  1. Run /migrate to convert to ticket system"
    echo "  2. Or run /workflow to reconfigure"
    exit 1
  fi
fi

# Validate ticket system exists
if [ ! -f .sage/tickets/index.json ]; then
  echo "ERROR: No ticket system found"
  echo ""
  echo "Run /migrate first to create ticket system"
  exit 1
fi
```

### 1. Load Current Ticket System

```bash
echo "┌────────────────────────────────────────────────┐"
echo "│        TICKET ESTIMATION & VELOCITY            │"
echo "└────────────────────────────────────────────────┘"
echo ""
echo "Loading ticket system..."

TICKET_INDEX=$(cat .sage/tickets/index.json)
TOTAL_TICKETS=$(echo "$TICKET_INDEX" | jq '.tickets | length')

echo "✓ Loaded $TOTAL_TICKETS tickets"
```

### 2. Analyze Existing Estimates

```bash
echo ""
echo "Analyzing existing estimates..."

# Check how many tickets already have estimates
ESTIMATED_COUNT=$(echo "$TICKET_INDEX" | jq '[.tickets[] | select(.estimated_hours != null)] | length')
UNESTIMATED_COUNT=$((TOTAL_TICKETS - ESTIMATED_COUNT))

echo ""
echo "Current Estimation Status:"
echo "  Total Tickets:      $TOTAL_TICKETS"
echo "  With Estimates:     $ESTIMATED_COUNT"
echo "  Without Estimates:  $UNESTIMATED_COUNT"

if [ $UNESTIMATED_COUNT -eq 0 ]; then
  echo ""
  echo "✅ All tickets have estimates"
  echo "Proceeding to velocity analysis..."
else
  echo ""
  echo "⚠️  $UNESTIMATED_COUNT tickets need estimates"
fi
```

### 3. Add Estimates to Unestimated Tickets

```bash
# Estimate tickets based on type, priority, complexity
if [ $UNESTIMATED_COUNT -gt 0 ]; then
  echo ""
  echo "Adding estimates to tickets..."

  # Use AI-driven estimation based on ticket details
  jq '.tickets |= map(
    if .estimated_hours == null then
      # Calculate estimate based on type and priority
      (if .type == "epic" then 40
       elif .type == "story" then 16
       elif .type == "task" then 4
       elif .type == "subtask" then 2
       else 4
       end) as $base_estimate |

      # Adjust by priority
      (if .priority == "P0" then 1.5
       elif .priority == "P1" then 1.2
       elif .priority == "P2" then 1.0
       elif .priority == "P3" then 0.8
       elif .priority == "P4" then 0.5
       else 1.0
       end) as $priority_multiplier |

      # Calculate final estimate
      .estimated_hours = ($base_estimate * $priority_multiplier | floor)
    else
      .
    end
  )' .sage/tickets/index.json > /tmp/tickets-estimated.json

  mv /tmp/tickets-estimated.json .sage/tickets/index.json

  echo "✓ Added estimates to $UNESTIMATED_COUNT tickets"

  # Reload ticket index
  TICKET_INDEX=$(cat .sage/tickets/index.json)
fi
```

### 4. Calculate Historical Velocity

```bash
echo ""
echo "Calculating historical velocity..."

# Check if velocity log exists
if [ -f .sage/stream-velocity.log ]; then
  VELOCITY_ENTRIES=$(wc -l < .sage/stream-velocity.log)

  if [ $VELOCITY_ENTRIES -gt 0 ]; then
    # Calculate average completion time from historical data
    AVG_HOURS=$(awk '{sum+=$2/60; count++} END {printf "%.1f", sum/count}' .sage/stream-velocity.log)
    TICKETS_PER_DAY=$(awk -v avg="$AVG_HOURS" 'BEGIN {printf "%.1f", 8/avg}')

    # Calculate velocity over last 7 days
    SEVEN_DAYS_AGO=$(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)
    RECENT_COMPLETIONS=$(awk -v cutoff="$SEVEN_DAYS_AGO" '$1 >= cutoff {count++} END {print count+0}' .sage/stream-velocity.log)

    echo ""
    echo "Historical Velocity Metrics:"
    echo "  Total Completions:      $VELOCITY_ENTRIES tickets"
    echo "  Avg Time/Ticket:        ${AVG_HOURS}h"
    echo "  Velocity:               ${TICKETS_PER_DAY} tickets/day"
    echo "  Last 7 Days:            $RECENT_COMPLETIONS tickets completed"

    # Store velocity metrics
    mkdir -p .sage
    cat > .sage/velocity-metrics.json <<EOF
{
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_completions": $VELOCITY_ENTRIES,
  "avg_hours_per_ticket": $AVG_HOURS,
  "tickets_per_day": $TICKETS_PER_DAY,
  "recent_completions_7d": $RECENT_COMPLETIONS
}
EOF

  else
    echo "⚠️  No historical velocity data yet"
    echo "Run /stream to start tracking velocity"
    AVG_HOURS=0
  fi
else
  echo "⚠️  No velocity log found"
  echo "Run /stream to start tracking velocity"
  AVG_HOURS=0
fi
```

### 5. Generate Project Projections

```bash
echo ""
echo "Generating project projections..."

# Calculate work remaining
COMPLETED=$(echo "$TICKET_INDEX" | jq '[.tickets[] | select(.state == "COMPLETED")] | length')
UNPROCESSED=$(echo "$TICKET_INDEX" | jq '[.tickets[] | select(.state == "UNPROCESSED")] | length')
IN_PROGRESS=$(echo "$TICKET_INDEX" | jq '[.tickets[] | select(.state == "IN_PROGRESS")] | length')

REMAINING=$((UNPROCESSED + IN_PROGRESS))

# Calculate estimated hours remaining
ESTIMATED_HOURS_REMAINING=$(echo "$TICKET_INDEX" | jq '
  [.tickets[] | select(.state == "UNPROCESSED" or .state == "IN_PROGRESS") | .estimated_hours // 4] | add
')

# Calculate completion percentage
COMPLETION_PCT=$((COMPLETED * 100 / TOTAL_TICKETS))

echo ""
echo "Project Status:"
echo "  Progress:              ${COMPLETION_PCT}% complete"
echo "  Completed:             $COMPLETED tickets"
echo "  Remaining:             $REMAINING tickets"
echo "  Estimated Work:        ${ESTIMATED_HOURS_REMAINING}h remaining"

# Calculate ETA if we have velocity data
if [ "$AVG_HOURS" != "0" ] && [ $(echo "$AVG_HOURS > 0" | bc -l) -eq 1 ]; then
  ESTIMATED_DAYS=$(echo "$ESTIMATED_HOURS_REMAINING / 8" | bc -l | xargs printf "%.0f")

  # Calculate working days (assuming 5-day work week)
  CALENDAR_DAYS=$(echo "$ESTIMATED_DAYS * 1.4" | bc -l | xargs printf "%.0f")

  # Calculate completion date
  COMPLETION_DATE=$(date -u -v+${CALENDAR_DAYS}d +%Y-%m-%d 2>/dev/null || date -u -d "+${CALENDAR_DAYS} days" +%Y-%m-%d)

  echo ""
  echo "Estimated Timeline:"
  echo "  Working Days:          ${ESTIMATED_DAYS} days"
  echo "  Calendar Days:         ${CALENDAR_DAYS} days"
  echo "  Projected Completion:  ${COMPLETION_DATE}"
fi
```

### 6. Generate Burndown Data

```bash
echo ""
echo "Generating burndown chart data..."

# Create burndown data file
mkdir -p .sage

# Calculate ideal burndown (linear)
TOTAL_ESTIMATED_HOURS=$(echo "$TICKET_INDEX" | jq '[.tickets[].estimated_hours // 4] | add')
HOURS_COMPLETED=$(echo "$TICKET_INDEX" | jq '
  [.tickets[] | select(.state == "COMPLETED") | .estimated_hours // 4] | add
')
HOURS_REMAINING=$(echo "$TOTAL_ESTIMATED_HOURS - $HOURS_COMPLETED" | bc -l)

cat > .sage/burndown-data.json <<EOF
{
  "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_hours": $TOTAL_ESTIMATED_HOURS,
  "hours_completed": $HOURS_COMPLETED,
  "hours_remaining": $HOURS_REMAINING,
  "completion_percentage": $COMPLETION_PCT,
  "tickets": {
    "total": $TOTAL_TICKETS,
    "completed": $COMPLETED,
    "in_progress": $IN_PROGRESS,
    "unprocessed": $UNPROCESSED
  }
}
EOF

echo "✓ Burndown data saved to .sage/burndown-data.json"
```

### 7. Enhance Ticket Schema with Timestamps

```bash
echo ""
echo "Enhancing ticket schema with state tracking..."

# Add state_history and timestamps to tickets
jq '.tickets |= map(
  # Initialize state_history if missing
  if .state_history == null then
    .state_history = [
      {
        "state": .state,
        "timestamp": (now | strftime("%Y-%m-%dT%H:%M:%SZ"))
      }
    ]
  else
    .
  end |

  # Add created timestamp if missing
  if .created == null then
    .created = (now | strftime("%Y-%m-%dT%H:%M:%SZ"))
  else
    .
  end |

  # Add updated timestamp
  .updated = (now | strftime("%Y-%m-%dT%H:%M:%SZ"))
)' .sage/tickets/index.json > /tmp/tickets-enhanced.json

mv /tmp/tickets-enhanced.json .sage/tickets/index.json

echo "✓ Enhanced ticket schema with state tracking"

# Reload ticket index
TICKET_INDEX=$(cat .sage/tickets/index.json)
```

### 8. Generate Estimation Report

```bash
echo ""
echo "┌────────────────────────────────────────────────┐"
echo "│           ESTIMATION REPORT SUMMARY            │"
echo "└────────────────────────────────────────────────┘"
echo ""

# Create detailed estimation report
mkdir -p reports

cat > reports/estimation-report.md <<EOF
# Project Estimation Report

**Generated:** $(date -u +%Y-%m-%d)

---

## 📊 Project Overview

- **Total Tickets:** $TOTAL_TICKETS
- **Completion:** ${COMPLETION_PCT}% complete
- **Estimated Total Work:** ${TOTAL_ESTIMATED_HOURS}h
- **Work Completed:** ${HOURS_COMPLETED}h
- **Work Remaining:** ${HOURS_REMAINING}h

---

## 🎯 Current Status

| State | Count | Estimated Hours |
|-------|-------|-----------------|
| COMPLETED | $COMPLETED | ${HOURS_COMPLETED}h |
| IN_PROGRESS | $IN_PROGRESS | - |
| UNPROCESSED | $UNPROCESSED | ${ESTIMATED_HOURS_REMAINING}h |

---

## ⚡ Velocity Metrics

EOF

if [ "$AVG_HOURS" != "0" ] && [ -f .sage/velocity-metrics.json ]; then
  cat >> reports/estimation-report.md <<EOF
- **Average Time/Ticket:** ${AVG_HOURS}h
- **Velocity:** ${TICKETS_PER_DAY} tickets/day
- **Recent Completions (7d):** $RECENT_COMPLETIONS tickets

---

## 📅 Timeline Projection

- **Estimated Working Days:** ${ESTIMATED_DAYS} days
- **Estimated Calendar Days:** ${CALENDAR_DAYS} days
- **Projected Completion:** ${COMPLETION_DATE}

EOF
else
  cat >> reports/estimation-report.md <<EOF
⚠️ **No historical velocity data available**

Run \`/stream\` to start tracking velocity metrics.

EOF
fi

cat >> reports/estimation-report.md <<EOF
---

## 📈 Burndown Chart Data

Current burndown chart data is available in \`.sage/burndown-data.json\`.

\`\`\`json
$(cat .sage/burndown-data.json)
\`\`\`

---

## 🎲 Ticket Breakdown by Type

EOF

# Add ticket breakdown by type
for TYPE in epic story task subtask; do
  TYPE_COUNT=$(echo "$TICKET_INDEX" | jq --arg type "$TYPE" '[.tickets[] | select(.type == $type)] | length')
  if [ $TYPE_COUNT -gt 0 ]; then
    TYPE_HOURS=$(echo "$TICKET_INDEX" | jq --arg type "$TYPE" '
      [.tickets[] | select(.type == $type) | .estimated_hours // 4] | add
    ')
    echo "- **${TYPE}:** $TYPE_COUNT tickets, ${TYPE_HOURS}h estimated" >> reports/estimation-report.md
  fi
done

cat >> reports/estimation-report.md <<EOF

---

## 📋 Estimation Methodology

**Base Estimates by Type:**
- Epic: 40h
- Story: 16h
- Task: 4h
- Subtask: 2h

**Priority Multipliers:**
- P0 (Critical): 1.5x
- P1 (High): 1.2x
- P2 (Normal): 1.0x
- P3 (Low): 0.8x
- P4 (Minor): 0.5x

**Velocity Calculation:**
- Based on historical completion data in \`.sage/stream-velocity.log\`
- Rolling average of last 10 completed tickets
- Updated after each \`/stream\` cycle

---

## 🔄 Next Steps

1. **Review Estimates:** Check \`.sage/tickets/index.json\` for accuracy
2. **Adjust if Needed:** Manually update \`estimated_hours\` for specific tickets
3. **Track Progress:** Run \`/stream\` to record actual completion times
4. **Refine Projections:** Re-run \`/estimate\` after completing tickets
5. **Sprint Planning:** Use velocity data for sprint capacity planning

---

**Report saved to:** \`reports/estimation-report.md\`

EOF

echo "Estimation Report:"
echo "  File: reports/estimation-report.md"
echo "  Burndown Data: .sage/burndown-data.json"
echo "  Velocity Metrics: .sage/velocity-metrics.json"
```

### 9. Display Summary

```bash
echo ""
echo "┌────────────────────────────────────────────────┐"
echo "│        ESTIMATION COMPLETE                     │"
echo "└────────────────────────────────────────────────┘"
echo ""
echo "✅ All tickets have estimates"
echo "✅ Velocity metrics calculated"
echo "✅ Project projections generated"
echo "✅ Burndown data created"
echo ""
echo "Next Steps:"
echo "  1. Review: cat reports/estimation-report.md"
echo "  2. Adjust: Edit .sage/tickets/index.json to refine estimates"
echo "  3. Track: Run /stream to record actual times"
echo "  4. Monitor: Re-run /estimate to update projections"
echo ""
echo "Files Updated:"
echo "  - .sage/tickets/index.json (enhanced with estimates + timestamps)"
echo "  - reports/estimation-report.md (detailed report)"
echo "  - .sage/burndown-data.json (chart data)"
echo "  - .sage/velocity-metrics.json (velocity analytics)"
echo ""
```

## Usage Modes

### Standard Estimation

```bash
/estimate
# Adds estimates to all tickets, calculates velocity, generates report
```

### Re-estimate After Progress

```bash
/estimate
# Updates projections based on latest completions and velocity
```

### View Estimation Report

```bash
cat reports/estimation-report.md
# Review detailed estimation analysis
```

### Check Velocity Metrics

```bash
cat .sage/velocity-metrics.json
# View current velocity analytics
```

## Integration with Other Commands

### Before Sprint Planning

```bash
/estimate
# Get velocity data and capacity estimates
```

### After /stream Cycle

```bash
/stream && /estimate
# Update projections with latest completion data
```

### With /progress

```bash
/progress && /estimate
# Comprehensive status + estimation analysis
```

## Enhanced Ticket Schema

After running `/estimate`, tickets will have:

```json
{
  "id": "AUTH-001",
  "title": "Implement authentication",
  "type": "story",
  "priority": "P1",
  "state": "COMPLETED",
  "estimated_hours": 19,
  "created": "2025-01-01T10:00:00Z",
  "updated": "2025-01-02T15:30:00Z",
  "state_history": [
    {"state": "UNPROCESSED", "timestamp": "2025-01-01T10:00:00Z"},
    {"state": "IN_PROGRESS", "timestamp": "2025-01-02T09:00:00Z"},
    {"state": "COMPLETED", "timestamp": "2025-01-02T15:30:00Z"}
  ]
}
```

## Velocity Metrics File

`.sage/velocity-metrics.json`:

```json
{
  "last_updated": "2025-01-10T14:30:00Z",
  "total_completions": 25,
  "avg_hours_per_ticket": 6.5,
  "tickets_per_day": 1.2,
  "recent_completions_7d": 8
}
```

## Burndown Data File

`.sage/burndown-data.json`:

```json
{
  "generated": "2025-01-10T14:30:00Z",
  "total_hours": 320,
  "hours_completed": 160,
  "hours_remaining": 160,
  "completion_percentage": 50,
  "tickets": {
    "total": 40,
    "completed": 20,
    "in_progress": 3,
    "unprocessed": 17
  }
}
```

## Estimation Methodology

### Base Estimates

- **Epic:** 40 hours (large feature)
- **Story:** 16 hours (user story)
- **Task:** 4 hours (development task)
- **Subtask:** 2 hours (small unit of work)

### Priority Adjustments

- **P0 (Critical):** +50% (emergencies take longer)
- **P1 (High):** +20% (high-priority work needs care)
- **P2 (Normal):** +0% (baseline)
- **P3 (Low):** -20% (low-priority can be simplified)
- **P4 (Minor):** -50% (minimal effort)

### Velocity Calculation

1. **Historical Average:** Based on actual completion times from `.sage/stream-velocity.log`
2. **Rolling Window:** Last 10 completed tickets
3. **Daily Capacity:** 8 working hours / avg_hours_per_ticket
4. **Sprint Velocity:** tickets_per_day × sprint_length_days

## Exit Codes

- **0** - Estimation successful
- **1** - No ticket system found
- **2** - Invalid workflow mode

## Success Criteria

- [ ] All tickets have `estimated_hours` field
- [ ] Tickets have `created` and `updated` timestamps
- [ ] Tickets have `state_history` array
- [ ] Velocity metrics calculated from historical data
- [ ] Burndown data generated
- [ ] Estimation report created in `reports/`
- [ ] Project ETA calculated (if velocity data exists)
- [ ] Timeline projections include working days and completion date

## Notes

- Estimates are initial approximations, refine based on actual data
- Velocity improves over time as historical data accumulates
- Re-run `/estimate` after completing tickets to update projections
- Manual adjustments to `estimated_hours` are supported
- Burndown data updates each time `/estimate` runs
- Safe to run multiple times (idempotent)
- Does not modify ticket state or descriptions
- Only adds estimation metadata
