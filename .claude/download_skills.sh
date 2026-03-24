#!/bin/bash
# Download Claude Skills repositories
# Phase 1: Skills Acquisition

set -e  # Exit on error

SKILLS_DIR=".claude/skills"
cd "$(dirname "$0")/.."

echo "📦 Downloading Claude Skills to $SKILLS_DIR..."
echo ""

# Create skills directory if it doesn't exist
mkdir -p "$SKILLS_DIR"
cd "$SKILLS_DIR"

# Function to clone or pull
clone_or_pull() {
    local repo_url=$1
    local dir_name=$2
    
    if [ -d "$dir_name" ]; then
        echo "  ⬆️  Updating $dir_name..."
        cd "$dir_name"
        git pull --quiet || echo "  ⚠️  Could not update $dir_name (may have local changes)"
        cd ..
    else
        echo "  ⬇️  Cloning $dir_name..."
        git clone --quiet "$repo_url" "$dir_name" || echo "  ❌ Failed to clone $dir_name"
    fi
}

echo "1️⃣  obra/superpowers ecosystem"
clone_or_pull "https://github.com/obra/superpowers.git" "superpowers"
clone_or_pull "https://github.com/obra/superpowers-skills.git" "superpowers-skills"
clone_or_pull "https://github.com/obra/superpowers-lab.git" "superpowers-lab"
echo ""

echo "2️⃣  Anthropic official skills"
clone_or_pull "https://github.com/anthropics/skills.git" "anthropic-official"
echo ""

echo "3️⃣  Community skills collections"
clone_or_pull "https://github.com/alirezarezvani/claude-skills.git" "alirezarezvani-skills"
clone_or_pull "https://github.com/travisvn/awesome-claude-skills.git" "awesome-list"
clone_or_pull "https://github.com/ComposioHQ/awesome-claude-skills.git" "composio-awesome"
clone_or_pull "https://github.com/VoltAgent/awesome-claude-skills.git" "voltagent-awesome"
clone_or_pull "https://github.com/abubakarsiddik31/claude-skills-collection.git" "claude-collection"
echo ""

echo "4️⃣  Security & DevOps skills"
echo "  ℹ️  Note: Some security skills may not have public repos"
echo "  Creating placeholder directories for reference..."
mkdir -p defense-in-depth
mkdir -p threat-hunting
mkdir -p secure-env
echo ""

echo "5️⃣  Integration & automation skills"
echo "  ℹ️  Note: Some integration skills may not have public repos"
echo "  Creating placeholder directories for reference..."
mkdir -p linear-skill
mkdir -p n8n-automation
mkdir -p aws-cdk
echo ""

echo "6️⃣  Scientific skills"
echo "  ℹ️  Note: Scientific skills may not have public repos"
echo "  Creating placeholder directory..."
mkdir -p scientific-skills
echo ""

echo "✅ Skills download complete!"
echo ""
echo "📊 Downloaded repositories:"
ls -1
echo ""
echo "📝 Next steps:"
echo "1. Review .claude/settings.local.json"
echo "2. Test skills in Claude Code"
echo "3. See docs/enhancement-plans/PROMPT_LIBRARY_IMPLEMENTATION_PLAN.md for usage"
