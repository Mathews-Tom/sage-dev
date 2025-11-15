#!/bin/bash
# stream-functions.sh - Testable functions for /stream command semi-auto mode
# Part of STREAM-011: Unit Test Suite

# ============================================================================
# COMPONENT GROUPING FUNCTIONS
# ============================================================================

# Extract component prefix from ticket ID
# Usage: extract_component_prefix "AUTH-001"
# Returns: "AUTH"
extract_component_prefix() {
  local ticket_id="$1"
  echo "$ticket_id" | cut -d'-' -f1
}

# Check if component prefix is standard (uppercase alphabetic only)
# Usage: is_standard_prefix "AUTH"
# Returns: 0 (true) or 1 (false)
is_standard_prefix() {
  local prefix="$1"
  local STANDARD_PATTERN='^[A-Z]+$'
  [[ "$prefix" =~ $STANDARD_PATTERN ]]
}

# Extract unique component prefixes from ticket JSON array
# Usage: extract_unique_prefixes '[{"id": "AUTH-001"}, {"id": "API-002"}]'
# Returns: "API\nAUTH" (sorted, unique)
extract_unique_prefixes() {
  local tickets_json="$1"
  echo "$tickets_json" | jq -r '
    [.[] | .id] |
    map(split("-")[0]) |
    unique |
    .[]
  ' | sort
}

# Group tickets by component prefix
# Usage: group_tickets_by_prefix '[{"id": "AUTH-001", "state": "UNPROCESSED"}, ...]' "AUTH"
# Returns: JSON array of ticket IDs for that prefix
group_tickets_by_prefix() {
  local tickets_json="$1"
  local prefix="$2"
  echo "$tickets_json" | jq -r "
    [.[] |
     select(.state == \"UNPROCESSED\") |
     select(.type == \"story\" or .type == \"feature\" or .type == \"Story\" or .type == \"Feature\") |
     select(.id | startswith(\"$prefix-\"))] |
    map(.id) |
    .[]
  "
}

# Filter UNPROCESSED story/feature tickets
# Usage: filter_unprocessed_stories '[{"id": "AUTH-001", "state": "UNPROCESSED", "type": "story"}, ...]'
# Returns: Filtered JSON array
filter_unprocessed_stories() {
  local tickets_json="$1"
  echo "$tickets_json" | jq '[.[] | select(.state == "UNPROCESSED") | select(.type == "story" or .type == "feature" or .type == "Story" or .type == "Feature")]'
}

# ============================================================================
# BATCH FILE FUNCTIONS
# ============================================================================

# Create batch file atomically (temp file + mv)
# Usage: create_batch_file_atomic "/path/to/batches" "AUTH" "AUTH-001\nAUTH-002"
# Returns: 0 on success, 1 on failure
create_batch_file_atomic() {
  local batch_dir="$1"
  local component_name="$2"
  local ticket_list="$3"

  # Validate inputs
  if [ -z "$batch_dir" ] || [ -z "$component_name" ] || [ -z "$ticket_list" ]; then
    return 1
  fi

  # Ensure batch directory exists
  mkdir -p "$batch_dir" || return 1

  # Atomic write: temp file + mv
  local temp_file="/tmp/${component_name}.batch.tmp.$$"
  local target_file="${batch_dir}/${component_name}.batch"

  echo "$ticket_list" > "$temp_file" || return 1
  mv "$temp_file" "$target_file" || return 1

  return 0
}

# Cleanup batch file for component
# Usage: cleanup_component_batch "/path/to/batches" "AUTH"
# Returns: 0 on success (or file doesn't exist), 1 on error
cleanup_component_batch() {
  local batch_dir="$1"
  local component_name="$2"

  local batch_file="${batch_dir}/${component_name}.batch"

  if [ -f "$batch_file" ]; then
    rm -f "$batch_file" || return 1
  fi

  return 0
}

# Validate batch file against ticket states
# Usage: validate_batch_file "/path/to/batches/AUTH.batch" '{"tickets": [...]}'
# Returns: Number of invalid tickets removed
validate_batch_file() {
  local batch_file="$1"
  local index_json="$2"
  local invalid_count=0

  if [ ! -f "$batch_file" ]; then
    return 0
  fi

  local temp_file="${batch_file}.tmp"
  > "$temp_file"

  while IFS= read -r ticket_id; do
    local ticket_state
    ticket_state=$(echo "$index_json" | jq -r ".tickets[] | select(.id == \"$ticket_id\") | .state")

    if [ "$ticket_state" = "UNPROCESSED" ]; then
      echo "$ticket_id" >> "$temp_file"
    else
      invalid_count=$((invalid_count + 1))
    fi
  done < "$batch_file"

  mv "$temp_file" "$batch_file"

  echo "$invalid_count"
}

# Check if batch file is empty
# Usage: is_batch_empty "/path/to/batches/AUTH.batch"
# Returns: 0 (true) if empty or doesn't exist, 1 (false) if has content
is_batch_empty() {
  local batch_file="$1"

  if [ ! -f "$batch_file" ]; then
    return 0
  fi

  if [ ! -s "$batch_file" ]; then
    return 0
  fi

  return 1
}

# Count tickets in batch file
# Usage: count_batch_tickets "/path/to/batches/AUTH.batch"
# Returns: Number of tickets (0 if file doesn't exist or is empty)
count_batch_tickets() {
  local batch_file="$1"

  if [ ! -f "$batch_file" ] || [ ! -s "$batch_file" ]; then
    echo "0"
    return
  fi

  wc -l < "$batch_file" | tr -d ' '
}

# Get list of batch files
# Usage: get_batch_files "/path/to/batches"
# Returns: List of .batch file paths
get_batch_files() {
  local batch_dir="$1"
  ls "${batch_dir}"/*.batch 2>/dev/null || echo ""
}

# ============================================================================
# COMPONENT STATISTICS FUNCTIONS
# ============================================================================

# Count tickets per component in batch directory
# Usage: get_component_stats "/path/to/batches"
# Returns: "COMPONENT:COUNT" lines
get_component_stats() {
  local batch_dir="$1"

  local batch_files
  batch_files=$(get_batch_files "$batch_dir")

  if [ -z "$batch_files" ]; then
    return
  fi

  echo "$batch_files" | while read -r batch_file; do
    local comp_name
    comp_name=$(basename "$batch_file" .batch)
    local comp_count
    comp_count=$(count_batch_tickets "$batch_file")
    echo "${comp_name}:${comp_count}"
  done
}

# ============================================================================
# SLUG/ID GENERATION FUNCTIONS
# ============================================================================

# Generate slug from component name
# Usage: generate_component_slug "Authentication Service"
# Returns: "authentication-service"
generate_component_slug() {
  local name="$1"
  # Trim leading/trailing whitespace, convert to lowercase, replace non-alphanumeric with dashes
  # Collapse multiple dashes, remove leading/trailing dashes
  echo "$name" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed -E 's/-+/-/g' | sed 's/^-//g' | sed 's/-$//g'
}

# Validate ticket ID format
# Usage: validate_ticket_id "AUTH-001"
# Returns: 0 (valid) or 1 (invalid)
validate_ticket_id() {
  local ticket_id="$1"
  local TICKET_PATTERN='^[A-Za-z0-9]+-[0-9]+$'
  [[ "$ticket_id" =~ $TICKET_PATTERN ]]
}

# ============================================================================
# EDGE CASE HANDLING
# ============================================================================

# Handle single-ticket component
# Usage: is_single_ticket_component "/path/to/batches/AUTH.batch"
# Returns: 0 (true) if exactly 1 ticket, 1 (false) otherwise
is_single_ticket_component() {
  local batch_file="$1"
  local count
  count=$(count_batch_tickets "$batch_file")
  [ "$count" -eq 1 ]
}

# Check if component should be skipped (empty)
# Usage: should_skip_component "/path/to/batches/AUTH.batch"
# Returns: 0 (skip) if empty, 1 (process) if has tickets
should_skip_component() {
  is_batch_empty "$1"
}
