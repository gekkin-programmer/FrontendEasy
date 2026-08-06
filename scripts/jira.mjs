#!/usr/bin/env node
// Minimal JIRA Cloud REST API v3 CLI — no dependencies beyond Node's built-in fetch.
// Reads credentials from .env.jira (gitignored, copy .env.jira.example to start).
//
// Usage:
//   node scripts/jira.mjs create "Title" "Description text" [IssueType] [flags]   (IssueType default: Task)
//   node scripts/jira.mjs update ISSUE-123 [flags]                        (edit an existing ticket)
//   node scripts/jira.mjs list ["extra JQL filter"]                        (defaults to your open tickets)
//   node scripts/jira.mjs sprints                                          (lists the board's sprints, with IDs)
//   node scripts/jira.mjs comment ISSUE-123 "Comment text"
//   node scripts/jira.mjs done ISSUE-123                                   (transitions to the first "done"-like status)
//   node scripts/jira.mjs open ISSUE-123                                   (prints the ticket's URL)
//
// Flags (create & update), all optional:
//   --sprint <id>       Sprint id (see: node scripts/jira.mjs sprints)
//   --labels a,b,c       Comma-separated labels
//   --start YYYY-MM-DD   Start date
//   --due YYYY-MM-DD     Due date
//   --points <number>    Story point estimate
//
// Field IDs are specific to this JIRA instance (project SCRUM) — found via
// GET /rest/api/3/field and /rest/api/3/issue/{key}/editmeta. If the project
// is ever rebuilt/recreated these customfield_* ids can change; re-run that
// lookup if create/update starts erroring on an unknown field.

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

// Custom field IDs for this JIRA instance (project SCRUM) — see the flag
// comment block above for how these were found.
const FIELD = {
  sprint: 'customfield_10020',
  points: 'customfield_10016',
  start: 'customfield_10015',
  due: 'duedate', // standard field, not custom
};

// Pulls --flag value pairs out of an args array, returning [positionalArgs, flags].
function splitFlags(args) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      flags[a.slice(2)] = args[i + 1];
      i++;
    } else {
      positional.push(a);
    }
  }
  return [positional, flags];
}

// Builds the `fields` object for create/update from parsed flags. Only sets
// keys the user actually passed, so `update` never clobbers unrelated fields.
function fieldsFromFlags(flags) {
  const fields = {};
  // Jira's sprint field wants a bare number on issue update, not an array
  // (confirmed against this instance: array form 400s with "sprint id must
  // be a number").
  if (flags.sprint) fields[FIELD.sprint] = Number(flags.sprint);
  if (flags.points) fields[FIELD.points] = Number(flags.points);
  if (flags.start) fields[FIELD.start] = flags.start;
  if (flags.due) fields[FIELD.due] = flags.due;
  if (flags.labels) fields.labels = flags.labels.split(',').map((l) => l.trim()).filter(Boolean);
  return fields;
}

const [, , cmd, ...rawArgs] = process.argv;

const [args, flags] = splitFlags(rawArgs);

switch (cmd) {
  case 'create': {
    const [title, description = '', issueType = 'Task'] = args;
    if (!title) { console.error('Usage: node scripts/jira.mjs create "Title" "Description" [IssueType] [flags]'); process.exit(1); }
    const data = await jiraFetch('/issue', {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          project: { key: JIRA_PROJECT_KEY },
          summary: title,
          description: toADF(description),
          issuetype: { name: issueType },
          ...fieldsFromFlags(flags),
        },
      }),
    });
    console.log(`Created ${data.key}: ${siteUrl}/browse/${data.key}`);
    break;
  }

  case 'update': {
    const [key] = args;
    if (!key) { console.error('Usage: node scripts/jira.mjs update ISSUE-123 [flags]'); process.exit(1); }
    const fields = fieldsFromFlags(flags);
    if (Object.keys(fields).length === 0) { console.error('No flags given — nothing to update. See flags in the usage header.'); process.exit(1); }
    await jiraFetch(`/issue/${key}`, { method: 'PUT', body: JSON.stringify({ fields }) });
    console.log(`Updated ${key}: ${siteUrl}/browse/${key}`);
    break;
  }

  case 'sprints': {
    const boards = await fetch(`${siteUrl}/rest/agile/1.0/board?projectKeyOrId=${JIRA_PROJECT_KEY}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    }).then((r) => r.json());
    const board = boards.values?.[0];
    if (!board) { console.log('No board found for this project.'); break; }
    const sprints = await fetch(`${siteUrl}/rest/agile/1.0/board/${board.id}/sprint?state=active,future`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    }).then((r) => r.json());
    if (!sprints.values?.length) { console.log('No active/future sprints.'); break; }
    for (const s of sprints.values) {
      console.log(`${s.id}  [${s.state}]  ${s.name}${s.startDate ? `  ${s.startDate.slice(0, 10)} → ${s.endDate?.slice(0, 10) ?? '?'}` : ''}`);
    }
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
    console.error('Unknown command. Use: create | update | list | sprints | comment | done | open');
    process.exit(1);
}
