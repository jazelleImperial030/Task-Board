import os
import json
import urllib.request
import urllib.error

def safe_env(key, default=""):
    val = os.environ.get(key, default)
    if val is None or val == "None" or val == "null":
        return default
    return val

pr_title = safe_env("PR_TITLE")
pr_body = safe_env("PR_BODY")
pr_author = safe_env("PR_AUTHOR")
pr_url = safe_env("PR_URL")
pr_number = safe_env("PR_NUMBER")
pr_branch = safe_env("PR_BRANCH")
pr_diff = safe_env("PR_DIFF")
openrouter_key = safe_env("OPENROUTER_API_KEY")
discord_url = safe_env("DISCORD_WEBHOOK_URL")

SYSTEM_CONTEXT = (
    "You are a team member at UTAK, a cloud-based POS (Point of Sale) system "
    "for restaurants, cafes, and retail businesses in the Philippines. You know "
    "the system inside out:\n\n"
    "UTAK SYSTEM OVERVIEW:\n"
    "- UTAK POS (Mobile App): The cashier-facing app used in stores. Handles "
    "transactions, cash drawer, shifts, receipts, kitchen display (KDS), inventory, "
    "order management, thermal printing, and offline-first operations. Integrates "
    "with delivery platforms (FoodPanda, Grab, Shopee, Lazada). Supports mall "
    "compliance modes (SM, Robinsons, Megaworld, etc.). BIR tax compliant.\n"
    "- UTAK Back Office (Web): The merchant dashboard. Provides sales analytics, "
    "transaction history, reports, inventory management, staff management, menu/item "
    "management, billing, settings, and multi-branch management for master accounts.\n"
    "- UTAK Cloud Functions: The backend. Handles payment processing (Stripe, Xendit, "
    "PayMongo, GCash), daily sales emails, inventory reset jobs (3:30 AM daily), "
    "Z-reading generation, push notifications, mall server integrations, "
    "OTP/authentication, and admin tools.\n"
    "- Database: Firebase Realtime Database. Each merchant has isolated data - "
    "transactions, settings, menu, inventory, shifts, cash drawer, orders, staff, devices.\n\n"
    "KEY OPERATIONS:\n"
    "- Cashiers use the POS app to ring up sales, manage cash drawer, process refunds, "
    "handle delivery orders, and generate shift reports (X/Z readings).\n"
    "- Store owners use the Back Office to monitor sales, manage inventory, configure "
    "settings, and run reports.\n"
    "- Cloud functions automate inventory resets, send daily sales emails, process "
    "payments, and sync with mall servers.\n\n"
    "CLIENTS & DEPARTMENTS AFFECTED:\n"
    "- Cashiers and store staff (POS app users)\n"
    "- Store owners and managers (Back Office users)\n"
    "- Customers (receipt changes, payment method changes, order flow changes)\n"
    "- Delivery operations (FoodPanda, Grab, etc.)\n"
    "- Mall compliance (SM, Robinsons, Megaworld reporting)\n"
    "- Finance/billing (payment processing, subscriptions)"
)


def call_openrouter(prompt_text, max_tokens=500):
    payload = json.dumps({
        "model": "openrouter/auto",
        "messages": [{"role": "user", "content": prompt_text}],
        "max_tokens": max_tokens
    }).encode()
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": "Bearer " + openrouter_key,
            "Content-Type": "application/json"
        }
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]


# Step 1: Evaluate if this PR affects operations
evaluate_prompt = (
    SYSTEM_CONTEXT + "\n\n"
    "You are reviewing a merged pull request. Your job is to decide: does this "
    "change affect ALL users across the entire system? You must be VERY strict. "
    "Only report changes that have a broad, system-wide impact on operations.\n\n"
    "ONLY REPORT if the change meets ALL of these criteria:\n"
    "1. It affects ALL merchants/stores, not just one or a few specific accounts\n"
    "2. It changes core behavior that every cashier, store owner, or customer will notice\n"
    "3. It is a significant operational change, not a minor tweak\n\n"
    "Examples of changes that SHOULD be reported:\n"
    "- A system-wide restriction like limiting cash drawer date range for everyone\n"
    "- A new payment method available to all stores\n"
    "- A bug fix that was affecting many/all users (e.g. wrong VAT on all receipts)\n"
    "- Changing the inventory reset time for all merchants\n"
    "- A new feature rolled out to all users\n"
    "- A system-wide compliance change (e.g. BIR receipt format update)\n\n"
    "DO NOT REPORT (SKIP) if:\n"
    "- It only affects one or a few specific merchants/accounts\n"
    "- It is a hardcoded config change (adding UIDs to arrays, toggling features for specific stores, "
    "enabling auto-print/auto-kitchen for one account, locking discounts for one merchant). "
    "These are ALWAYS routine per-client requests, ALWAYS skip.\n"
    "- It is a code refactor, rename, or reorganization with no behavior change\n"
    "- It only updates CI/CD, GitHub Actions, workflows, or dev tooling\n"
    "- It only changes code formatting, comments, or documentation\n"
    "- It is a dependency update with no feature change\n"
    "- It is an internal dev tool or admin tool change\n"
    "- It is a minor bug fix that only affected a small number of users\n"
    "- It is a test file addition or update\n\n"
    "When in doubt, SKIP. It is better to not report than to report something irrelevant.\n\n"
    "Respond with EXACTLY one of these formats:\n"
    "REPORT: (if it should be reported)\n"
    "SKIP: (if it should not be reported)\n\n"
    "PR Title: " + pr_title + "\n"
    "PR Description: " + pr_body + "\n"
    "Branch: " + pr_branch + "\n\n"
    "Code Diff:\n" + pr_diff[:10000]
)

try:
    evaluation = call_openrouter(evaluate_prompt, max_tokens=50)
    print("Evaluation: " + evaluation)
except Exception as e:
    print("::warning::Evaluation failed: " + str(e) + ", defaulting to REPORT")
    evaluation = "REPORT:"

if evaluation.strip().upper().startswith("SKIP"):
    print("PR does not affect operations. Skipping Discord report.")
    exit(0)

# Step 2: Generate natural summary
summary_prompt = (
    SYSTEM_CONTEXT + "\n\n"
    "A pull request was just merged. Write a message for the team Discord channel "
    "explaining what changed and how it affects operations.\n\n"
    "Guidelines:\n"
    "- Start with 'Hi everyone,' or 'Hello everyone,'\n"
    "- 3-5 sentences, professional but friendly tone\n"
    "- Explain the behavioral change and WHY it matters\n"
    "- Mention which part of the system is affected (POS, Back Office, cloud functions, etc.)\n"
    "- If it is a bugfix, explain what was going wrong and how it is fixed now\n"
    "- If it is a new feature or restriction, explain what users will notice\n"
    "- Always complete your sentences\n"
    "- Do NOT mention any developer names or who merged it. Use 'the tech team' instead\n"
    "- Do NOT use em dashes (--). Use commas instead\n"
    "- Do NOT add informal or casual remarks like 'feel free to poke at it' or 'now is a good time'\n"
    "- Do not mention file names, function names, variable names, or any code details\n"
    "- Do not use bullet points or markdown formatting\n"
    "- Write as plain text, professional and clear\n\n"
    "PR Title: " + pr_title + "\n"
    "PR Description: " + pr_body + "\n"
    "Branch: " + pr_branch + "\n"
    "Author: " + pr_author + "\n\n"
    "Code Diff:\n" + pr_diff[:10000]
)

try:
    summary = call_openrouter(summary_prompt, max_tokens=500)
    print("AI Summary: " + summary)
except Exception as e:
    print("::warning::AI summarization failed: " + str(e))
    summary = "A change was merged: " + pr_title

# Determine if this is a bugfix based on branch name or PR title
is_bugfix = any(keyword in (pr_branch + " " + pr_title).lower() for keyword in ["bugfix", "fix", "hotfix", "patch"])

# Post to Discord
clean_summary = summary.strip()[:1900]
prefix = "(Bugfix) " if is_bugfix else ""
message = prefix + clean_summary

discord_payload = json.dumps({"content": message}).encode()

req = urllib.request.Request(
    discord_url,
    data=discord_payload,
    headers={
        "Content-Type": "application/json",
        "User-Agent": "UTAK-PR-Reporter/1.0"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        print("Discord response: " + str(resp.status))
        print("Discord notification sent!")
except urllib.error.HTTPError as e:
    error_body = e.read().decode()
    print("Discord error " + str(e.code) + ": " + error_body)
    raise
