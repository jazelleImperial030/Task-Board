import os
import json
import urllib.request
import urllib.error

pr_title = os.environ.get("PR_TITLE", "")
pr_body = os.environ.get("PR_BODY", "") or ""
pr_author = os.environ.get("PR_AUTHOR", "")
pr_url = os.environ.get("PR_URL", "")
pr_number = os.environ.get("PR_NUMBER", "")
pr_branch = os.environ.get("PR_BRANCH", "")
pr_diff = os.environ.get("PR_DIFF", "")
openrouter_key = os.environ.get("OPENROUTER_API_KEY", "")
discord_url = os.environ.get("DISCORD_WEBHOOK_URL", "")

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
    "change affect how the business operates? Does it impact cashiers, store owners, "
    "customers, delivery operations, or any department?\n\n"
    "REPORT if the change:\n"
    "- Affects how cashiers use the POS (transaction flow, cash drawer behavior, "
    "receipt changes, printing, shift operations)\n"
    "- Changes what store owners see or can do in the Back Office (reports, settings, "
    "dashboard, inventory)\n"
    "- Impacts customers (payment methods, order flow, receipts, online ordering)\n"
    "- Affects delivery operations or mall compliance\n"
    "- Changes billing, subscriptions, or payment processing\n"
    "- Fixes a bug that was causing real operational issues (wrong calculations, data "
    "loss, incorrect alerts)\n"
    "- Adds restrictions or limits that affect daily operations (e.g. date range limits, "
    "download limits)\n"
    "- Changes inventory behavior, automated jobs, or notifications\n\n"
    "DO NOT REPORT if the change:\n"
    "- Is purely a code refactor with no behavior change\n"
    "- Only updates CI/CD, GitHub Actions, workflows, or dev tooling\n"
    "- Is a hardcoded config change for a specific merchant (unless it reveals a broader issue)\n"
    "- Only changes code formatting, comments, or documentation\n"
    "- Is a dependency update with no feature change\n"
    "- Is an internal dev tool change\n\n"
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
    "explaining what changed and how it affects operations. Write naturally like a "
    "team member giving an update - not like a bot or a changelog.\n\n"
    "Guidelines:\n"
    "- 3-5 sentences, conversational tone\n"
    "- Explain the behavioral change and WHY it matters\n"
    "- Mention which part of the system is affected (POS, Back Office, cloud functions, etc.)\n"
    "- If it is a bugfix, explain what was going wrong and how it is fixed now\n"
    "- If it is a new feature or restriction, explain what users will notice\n"
    "- Always complete your sentences\n"
    "- Do not mention file names, function names, variable names, or any code details\n"
    "- Do not use bullet points or markdown formatting\n"
    "- Write as plain text, like you are talking to the team on Discord\n\n"
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

# Post to Discord
clean_summary = summary.strip()[:1900]
separator = "\u2014" * 57
message = (
    separator + "\n"
    "PR #" + pr_number + " Merged by " + pr_author + "\n"
    "Branch: **" + pr_branch + "**  Created by: " + pr_author + "\n"
    "Summary: " + clean_summary
)

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
