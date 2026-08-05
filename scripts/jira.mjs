#!/usr/bin/env node
// Minimal JIRA Cloud REST API v3 CLI — no dependencies beyond Node's built-in fetch.
// Reads credentials from .env.jira (gitignored, copy .env.jira.example to start).
//
// Usage:
//   node scripts/jira.mjs create "Title" "Description text" [IssueType]   (IssueType default: Task)
//   node scripts/jira.mjs list ["extra JQL filter"]                        (defaults to your open tickets)
//   node scripts/jira.mjs comment ISSUE-123 "Comment text"
//   node scripts/jira.mjs done ISSUE-123                                   (transitions to the first "done"-like status)
//   node scripts/jira.mjs open ISSUE-123                                   (prints the ticket's URL)

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.jira');

function loadEnv(path) {
  if (!existsSync(path)) {
    console.error(`Missing ${path}. Copy .env.jira.example to .env.jira and fill in your JIRA credentials.`);
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv(envPath);
const { JIRA_SITE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = env;
for (const [k, v] of Object.entries({ JIRA_SITE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY })) {
  if (!v) { console.error(`${k} is empty in .env.jira`); process.exit(1); }
}

const siteUrl = JIRA_SITE_URL.replace(/\/$/, '');
const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

async function jiraFetch(path, options = {}) {
  const res = await fetch(`${siteUrl}/rest/api/3${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    console.error(`JIRA API error [${res.status}] ${path}`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

function toADF(text) {
  return {
    type: 'doc',
    version: 1,
    content: text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : [],
    })),
  };
}

const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case 'create': {
    const [title, description = '', issueType = 'Task'] = args;
    if (!title) { console.error('Usage: node scripts/jira.mjs create "Title" "Description" [IssueType]'); process.exit(1); }
    const data = await jiraFetch('/issue', {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          project: { key: JIRA_PROJECT_KEY },
          summary: title,
          description: toADF(description),
          issuetype: { name: issueType },
        },
      }),
    });
    console.log(`Created ${data.key}: ${siteUrl}/browse/${data.key}`);
    break;
  }

  case 'list': {
    const extraJql = args.join(' ');
    const jql = extraJql || `assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC`;
    // POST (not GET) — matches Atlassian's documented /search/jql body shape exactly
    // and avoids URL-encoding/length issues with longer JQL strings.
    const data = await jiraFetch('/search/jql', {
      method: 'POST',
      body: JSON.stringify({ jql, fields: ['summary', 'status'], maxResults: 25 }),
    });
    if (!data.issues?.length) { console.log('No matching tickets.'); break; }
    for (const issue of data.issues) {
      console.log(`${issue.key}  [${issue.fields.status.name}]  ${issue.fields.summary}`);
    }
    break;
  }

  case 'comment': {
    const [key, text] = args;
    if (!key || !text) { console.error('Usage: node scripts/jira.mjs comment ISSUE-123 "Comment text"'); process.exit(1); }
    await jiraFetch(`/issue/${key}/comment`, {
      method: 'POST',
      body: JSON.stringify({ body: toADF(text) }),
    });
    console.log(`Commented on ${key}.`);
    break;
  }

  case 'done': {
    const [key] = args;
    if (!key) { console.error('Usage: node scripts/jira.mjs done ISSUE-123'); process.exit(1); }
    const transitions = await jiraFetch(`/issue/${key}/transitions`, { method: 'GET' });
    const match = transitions.transitions.find((t) => /done|closed|resolved/i.test(t.name));
    if (!match) {
      console.error(`No "done"-like transition found. Available: ${transitions.transitions.map((t) => t.name).join(', ')}`);
      process.exit(1);
    }
    await jiraFetch(`/issue/${key}/transitions`, {
      method: 'POST',
      body: JSON.stringify({ transition: { id: match.id } }),
    });
    console.log(`${key} → ${match.name}`);
    break;
  }

  case 'open': {
    const [key] = args;
    if (!key) { console.error('Usage: node scripts/jira.mjs open ISSUE-123'); process.exit(1); }
    console.log(`${siteUrl}/browse/${key}`);
    break;
  }

  default:
    console.error('Unknown command. Use: create | list | comment | done | open');
    process.exit(1);
}
