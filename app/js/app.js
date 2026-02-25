const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'qwen2.5:14b';
const API_BASE = window.location.origin + '/api';

const SYSTEM_PROMPT = `You are a helpful AI assistant. Please follow these rules:
1. Provide accurate and honest responses. If you're not sure about something, say "I'm not certain" rather than guessing.
2. Give detailed, comprehensive, and well-structured answers that are easy to understand.
3. When answering programming questions, provide complete code examples with detailed explanations.
4. Be respectful, professional, and helpful at all times.`;

let conversations = [];
let currentChatId = null;
let isGenerating = false;

async function apiGetChats() {
  const res = await fetch(`${API_BASE}/chats`);
  return res.json();
}

async function apiCreateChat(chat) {
  await fetch(`${API_BASE}/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chat)
  });
}

async function apiUpdateChat(chat) {
  await fetch(`${API_BASE}/chats/${chat.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chat)
  });
}

async function apiDeleteChat(id) {
  await fetch(`${API_BASE}/chats/${id}`, { method: 'DELETE' });
}

function parseMarkdown(text) {
  let html = text;

  // Store code blocks temporarily to protect them from other replacements
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    codeBlocks.push(`<pre><code>${code}</code></pre>`);
    return placeholder;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Convert line breaks: double newlines to paragraph breaks, single newlines to <br>
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = '<p>' + html + '</p>';

  // Clean up paragraph tags around block elements
  html = html.replace(/<p>\s*(<h[123]>)/g, '$1');
  html = html.replace(/(<\/h[123]>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(___CODE_BLOCK_\d+___)/g, '$1');
  html = html.replace(/(___CODE_BLOCK_\d+___)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*<\/p>/g, '');

  // Restore code blocks
  codeBlocks.forEach((code, i) => {
    html = html.replace(`___CODE_BLOCK_${i}___`, code);
  });

  return html;
}

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US');
}

function getCurrentChat() {
  return conversations.find(c => c.id === currentChatId);
}

async function newChat() {
  const emptyTempChat = conversations.find(c => c.messages.length === 0 && c.isTemporary);
  if (emptyTempChat) {
    currentChatId = emptyTempChat.id;
    document.getElementById('chatTitle').textContent = emptyTempChat.title;
    renderMessages();
    document.getElementById('userInput').focus();
    return;
  }

  const chat = {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemporary: true
  };
  conversations.unshift(chat);
  currentChatId = chat.id;
  renderMessages();
  document.getElementById('chatTitle').textContent = 'New Chat';
  document.getElementById('userInput').focus();
}

function switchChat(id) {
  currentChatId = id;
  const chat = getCurrentChat();
  if (chat) {
    document.getElementById('chatTitle').textContent = chat.title;
    renderSessions();
    renderMessages();
  }
  // Close sidebar on mobile after switching chat
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
  }
}

async function deleteChat(id, e) {
  e.stopPropagation();
  if (!confirm('Are you sure you want to delete this conversation?')) return;
  conversations = conversations.filter(c => c.id !== id);
  await apiDeleteChat(id);
  if (currentChatId === id) {
    if (conversations.length > 0) {
      currentChatId = conversations[0].id;
      document.getElementById('chatTitle').textContent = conversations[0].title;
    } else {
      currentChatId = null;
      document.getElementById('chatTitle').textContent = 'New Chat';
    }
  }
  renderSessions();
  renderMessages();
}

function renderSessions() {
  const container = document.getElementById('sessionList');

  const savedConversations = conversations.filter(c => !c.isTemporary);

  if (savedConversations.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;">No conversations yet</div>';
    return;
  }

  const groups = {};
  savedConversations.forEach(c => {
    const label = formatDate(c.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });

  let html = '';
  for (const [label, chats] of Object.entries(groups)) {
    html += `<div class="session-group-label">${label}</div>`;
    chats.forEach(c => {
      const preview = c.messages.length > 0
        ? c.messages[c.messages.length - 1].content.substring(0, 50)
        : 'Empty conversation';
      const time = formatTime(c.updatedAt);
      const msgCount = c.messages.length;
      html += `
        <div class="session-item ${c.id === currentChatId ? 'active' : ''}" onclick="switchChat('${c.id}')">
          <div class="session-title">${escapeHtml(c.title)}</div>
          <div class="session-meta">
            <span>${time}</span>
            <span>${msgCount} message${msgCount !== 1 ? 's' : ''}</span>
          </div>
          <div class="session-preview">${escapeHtml(preview)}</div>
          <button class="session-delete-btn" onclick="deleteChat('${c.id}', event)" title="Delete conversation">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>`;
    });
  }
  container.innerHTML = html;
}

function filterSessions(query) {
  const items = document.querySelectorAll('.session-item');
  const q = query.toLowerCase();
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) ? '' : 'none';
  });
}

function renderMessages() {
  const container = document.getElementById('messages');
  const chat = getCurrentChat();

  if (!chat || chat.messages.length === 0) {
    container.innerHTML = '<div class="empty-state" id="emptyState">Type a message to start chatting</div>';
    return;
  }

  let html = '';
  chat.messages.forEach(msg => {
    const avatar = msg.role === 'user' ? 'U' : 'Q';
    html += `
      <div class="message ${msg.role}">
        <div class="message-avatar">${avatar}</div>
        <div>
          <div class="message-content">${msg.role === 'user' ? escapeHtml(msg.content).replace(/\n/g, '<br>') : parseMarkdown(msg.content)}</div>
          <div class="message-time">${formatTime(msg.timestamp)}</div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  scrollToBottom();
}

function appendMessageToDOM(role, content, timestamp) {
  const container = document.getElementById('messages');
  const emptyState = document.getElementById('emptyState');
  if (emptyState) emptyState.remove();

  const avatar = role === 'user' ? 'U' : 'Q';
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div>
      <div class="message-content">${role === 'user' ? escapeHtml(content).replace(/\n/g, '<br>') : parseMarkdown(content)}</div>
      <div class="message-time">${formatTime(timestamp)}</div>
    </div>`;
  container.appendChild(div);
  scrollToBottom();
  return div;
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text || isGenerating) return;

  if (!currentChatId) {
    await newChat();
  }

  const chat = getCurrentChat();
  if (!chat) {
    console.error('Failed to get current chat');
    return;
  }

  const now = new Date().toISOString();

  const userMsg = { role: 'user', content: text, timestamp: now };
  chat.messages.push(userMsg);
  chat.updatedAt = now;

  if (chat.messages.filter(m => m.role === 'user').length === 1) {
    chat.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
    document.getElementById('chatTitle').textContent = chat.title;
  }

  if (chat.isTemporary) {
    delete chat.isTemporary;
    await apiCreateChat(chat);
  } else {
    await apiUpdateChat(chat);
  }

  renderSessions();
  appendMessageToDOM('user', text, now);

  input.value = '';
  autoResize(input);

  isGenerating = true;
  document.getElementById('sendBtn').disabled = true;

  const container = document.getElementById('messages');
  const aiDiv = document.createElement('div');
  aiDiv.className = 'message assistant';
  aiDiv.innerHTML = `
    <div class="message-avatar">Q</div>
    <div>
      <div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
      <div class="message-time">${formatTime(new Date())}</div>
    </div>`;
  container.appendChild(aiDiv);
  scrollToBottom();

  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chat.messages.map(m => ({ role: m.role, content: m.content }))
  ];

  let fullResponse = '';

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        stream: true
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const contentEl = aiDiv.querySelector('.message-content');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            fullResponse += data.message.content;
            // During streaming, show plain text with line breaks preserved
            contentEl.innerHTML = '<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: var(--font); font-size: 14px; margin: 0; padding: 0; background: transparent; color: inherit; line-height: 1.65;">' + escapeHtml(fullResponse) + '</pre>';
            scrollToBottom();
          }
        } catch (e) { }
      }
    }

    // After streaming is complete, parse the full markdown
    contentEl.innerHTML = parseMarkdown(fullResponse);

    chat.messages.push({
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date().toISOString()
    });
    chat.updatedAt = new Date().toISOString();
    await apiUpdateChat(chat);
    renderSessions();

  } catch (err) {
    const contentEl = aiDiv.querySelector('.message-content');
    contentEl.innerHTML = `<p style="color:#e74c3c;">Connection error: ${escapeHtml(err.message)}</p>
      <p style="color:var(--text-secondary);font-size:13px;">Please ensure Ollama is running (ollama serve)</p>`;
  }

  isGenerating = false;
  document.getElementById('sendBtn').disabled = false;
  document.getElementById('userInput').focus();
}

function handleKey(e) {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Shift+Enter: insert newline (default behavior, allow it)
      return;
    } else {
      // Enter without Shift: send message
      e.preventDefault();
      sendMessage();
    }
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
  const container = document.getElementById('messages');
  container.scrollTop = container.scrollHeight;
}

async function clearChat() {
  const chat = getCurrentChat();
  if (!chat) return;
  if (!confirm('Are you sure you want to clear this conversation?')) return;
  chat.messages = [];
  chat.updatedAt = new Date().toISOString();
  await apiUpdateChat(chat);
  renderSessions();
  renderMessages();
}

function exportChat() {
  const chat = getCurrentChat();
  if (!chat || chat.messages.length === 0) return;

  let md = `# ${chat.title}\n\n`;
  chat.messages.forEach(m => {
    const label = m.role === 'user' ? '**You**' : '**Qwen**';
    md += `${label}: ${m.content}\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chat.title}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.getElementById('sidebarToggle');
  const collapseIcon = toggleBtn.querySelector('.icon-collapse');
  const expandIcon = toggleBtn.querySelector('.icon-expand');

  // Check if mobile device
  if (window.innerWidth <= 768) {
    // Mobile: use show class and overlay
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
  } else {
    // Desktop: use collapsed class
    const isCollapsed = sidebar.classList.toggle('collapsed');

    // Toggle icon and tooltip
    if (isCollapsed) {
      collapseIcon.style.display = 'none';
      expandIcon.style.display = 'block';
      toggleBtn.title = 'Expand sidebar';
    } else {
      collapseIcon.style.display = 'block';
      expandIcon.style.display = 'none';
      toggleBtn.title = 'Collapse sidebar';
    }
  }
}

function initResizer() {
  const resizer = document.getElementById('resizer');
  const sidebar = document.getElementById('sidebar');
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    resizer.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const delta = e.clientX - startX;
    const newWidth = startWidth + delta;

    // Limit min and max width
    if (newWidth >= 200 && newWidth <= 500) {
      sidebar.style.width = newWidth + 'px';
      sidebar.style.minWidth = newWidth + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

async function init() {
  try {
    conversations = await apiGetChats();
  } catch {
    conversations = [];
  }

  // Load the most recent chat, or create a new one if none exist
  if (conversations.length > 0) {
    currentChatId = conversations[0].id;
    document.getElementById('chatTitle').textContent = conversations[0].title;
  } else {
    await newChat();
  }

  renderSessions();
  renderMessages();
  document.getElementById('userInput').focus();

  // Initialize resizer
  initResizer();
}

init();
