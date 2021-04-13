import { buildTelegramUrl, markdownEscape, markdownUrlEscape } from './telegram'
import { trimBody } from './utils'

const EVENT_PING = 'ping'
const EVENT_COMMIT_COMMENT = 'commit_comment'
const EVENT_DISCUSSION = 'discussion'
const EVENT_DISCUSSION_COMMENT = 'discussion_comment'
const EVENT_ISSUE_COMMENT = 'issue_comment'
const EVENT_ISSUES = 'issues'
const EVENT_PR = 'pull_request'
const EVENT_PUSH = 'push'

export async function handleRequest(request: Request): Promise<Response> {
  const { headers, url, method } = request
  const pathName = new URL(url).pathname

  const ua = headers.get('User-Agent') || ''
  const ct = headers.get('Content-Type') || ''
  const event = headers.get('X-GitHub-Event') || ''

  if (
    method != 'POST' ||
    !ua.startsWith('GitHub-Hookshot/') ||
    !ct.includes('application/json' || event != '' || pathName != '/webhook')
  ) {
    return new Response('403 Forbidden', { status: 403 })
  }

  const data = await request.json()

  switch (event) {
    case EVENT_PING:
      return handlePing(data)
    case EVENT_COMMIT_COMMENT:
      return handleCommitComment(data)
    case EVENT_DISCUSSION:
      return handleDiscussion(data)
    case EVENT_DISCUSSION_COMMENT:
      return handleDiscussionComment(data)
    case EVENT_ISSUE_COMMENT:
      return handleIssueComment(data)
    case EVENT_ISSUES:
      return handleIssues(data)
    case EVENT_PR:
      return handlePR(data)
    case EVENT_PUSH:
      return handlePush(data)
    default:
      return new Response(`request method: ${request.method} ${pathName}`)
  }
}

async function handlePing(data: any): Promise<Response> {
  const repoName = markdownEscape(data.repository.name)
  const htmlUrl = markdownUrlEscape(data.repository.html_url)
  const text = `*New webhook for* [${repoName}](${htmlUrl})`
  return fetch(buildTelegramUrl(text))
}

async function handleCommitComment(data: any): Promise<Response> {
  const repoName = markdownEscape(data.repository.name)
  const htmlUrl = markdownUrlEscape(data.comment.html_url)
  const sender = markdownEscape(data.comment.user.login)
  const senderUrl = markdownEscape(data.comment.user.html_url)
  const body = trimBody(markdownEscape(data.comment.body))
  const commitId = markdownEscape(data.comment.commit_id).substring(0, 7)
  const text = `*New commit comment for* [${repoName} ${commitId}](${htmlUrl})\n*by* [${sender}](${senderUrl})\n\n${body}`
  return fetch(buildTelegramUrl(text))
}

async function handleDiscussion(data: any): Promise<Response> {
  if (data.action != 'created') {
    return new Response('OK')
  }
  const repoName = markdownEscape(data.repository.name)
  const htmlUrl = markdownUrlEscape(data.discussion.html_url)
  const number = data.discussion.number
  const sender = markdownEscape(data.discussion.user.login)
  const senderUrl = markdownEscape(data.discussion.user.html_url)
  const category = markdownEscape(data.discussion.category.name)
  const title = markdownEscape(data.discussion.title)
  const body = trimBody(markdownEscape(data.discussion.body))
  const text = `*New discussion for* [${repoName}\\#${number} \\[${category}\\] ${title}](${htmlUrl})\n*by* [${sender}](${senderUrl})\n\n${body}`
  return fetch(buildTelegramUrl(text))
}

async function handleDiscussionComment(data: any): Promise<Response> {
  if (data.action != 'created') {
    return new Response('OK')
  }
  const repoName = markdownEscape(data.repository.name)
  const htmlUrl = markdownUrlEscape(data.comment.html_url)
  const number = data.discussion.number
  const category = markdownEscape(data.discussion.category.name)
  const title = markdownEscape(data.discussion.title)
  const sender = markdownEscape(data.comment.user.login)
  const senderUrl = markdownEscape(data.comment.user.html_url)
  const body = trimBody(markdownEscape(data.comment.body))
  const text = `*New comment for discussion* [${repoName}\\#${number} \\[${category}\\] ${title}](${htmlUrl})\n*by* [${sender}](${senderUrl})\n\n${body}`
  return fetch(buildTelegramUrl(text))
}

async function handleIssueComment(data: any): Promise<Response> {
  if (data.action != 'created') {
    return new Response('OK')
  }
  const repoName = markdownEscape(data.repository.name)
  const number = data.issue.number
  const htmlUrl = markdownUrlEscape(data.issue.html_url)
  const title = markdownEscape(data.issue.title)
  const sender = markdownEscape(data.comment.user.login)
  const senderUrl = markdownEscape(data.comment.user.html_url)
  const body = trimBody(markdownEscape(data.comment.body))
  const text = `*New comment for issue* [${repoName}\\#${number} ${title}](${htmlUrl})\n*by* [${sender}](${senderUrl})\n\n${body}`
  return fetch(buildTelegramUrl(text))
}

async function handleIssues(data: any): Promise<Response> {
  const action = data.action
  let actionText = ''
  switch (action) {
    case 'opened':
      actionText = 'New issue'
      break
    // case 'closed':
    //   actionText = 'Issue closed'
    //   break
    default:
      return new Response('OK')
  }
  const repoName = markdownEscape(data.repository.name)
  const number = data.issue.number
  const htmlUrl = markdownUrlEscape(data.issue.html_url)
  const title = markdownEscape(data.issue.title)
  const sender = markdownEscape(data.issue.user.login)
  const senderUrl = markdownEscape(data.issue.user.html_url)
  const body = trimBody(markdownEscape(data.issue.body))
  const text = `*${actionText} for* [${repoName}\\#${number} ${title}](${htmlUrl})\n*by* [${sender}](${senderUrl})\n\n${body}`
  return fetch(buildTelegramUrl(text))
}

async function handlePR(data: any): Promise<Response> {
  const action = data.action
  let actionText = ''
  switch (true) {
    case action == 'opened':
      actionText = 'New Pull Request'
      break
    // case action == 'closed' && !data.pull_request.merged: // closed no merge
    //   actionText = 'Pull Request closed'
    //   break
    default:
      return new Response('OK')
      break
  }

  const repoName = markdownEscape(data.repository.name)
  const htmlUrl = markdownUrlEscape(data.pull_request.html_url)
  const title = markdownEscape(data.pull_request.title)
  const sender = markdownEscape(data.pull_request.user.login)
  const senderUrl = markdownEscape(data.pull_request.user.html_url)
  const body = trimBody(markdownEscape(data.pull_request.body))
  const text = `*${actionText} for* [${repoName} ${title}](${htmlUrl})\n*by* [${sender}](${senderUrl})\n\n${body}`
  return fetch(buildTelegramUrl(text))
}

async function handlePush(data: any): Promise<Response> {
  const repoName = markdownEscape(data.repository.name)
  const ref = markdownEscape(data.ref)
  const commits = data.commits
  const compare = markdownUrlEscape(data.compare)

  let body = ''
  commits.forEach((commit: { id: string; url: string; message: string; author: { name: string } }) => {
    const commitId = markdownEscape(commit.id).substring(0, 7)
    const commitUrl = markdownUrlEscape(commit.url)
    const commitMsg = markdownEscape(commit.message)
    const committer = markdownEscape(commit.author.name)
    body += `[${commitId}](${commitUrl}): ${commitMsg} by ${committer}\n`
  });

  const text = `[${commits.length} new commit](${compare}) *to ${repoName} ${ref}*\n\n${body}`
  return fetch(buildTelegramUrl(text))
}