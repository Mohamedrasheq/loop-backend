# Test Drive: Level 2 AI Assistant

Follow these 3 steps to see the assistant draft and "execute" a GitHub issue.

## 1. Add a GitHub-Ready Task
Run this to add a task that the AI will recognize as a "GitHub Issue" candidate.

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "userId": "user_123",
  "text": "Need to fix the broken login button in the loop-backend repo. Every time I click it, it 404s.",
  "timezone": "UTC"
}' "http://localhost:3000/api/capture"
```

---

## 2. Get the AI's Draft
Call the assistant. You will see a new `proposed_actions` array in the JSON response.

```bash
curl "http://localhost:3000/api/assistant?userId=user_123"
```

**What to look for in the response:**
```json
"proposed_actions": [
  {
    "type": "create_github_issue",
    "payload": {
      "repo": "your-username/loop-backend",
      "title": "Fix broken login button - 404 Error",
      "body": "The login button is currently returning a 404..."
    }
  }
]
```

---

## 3. Approve and Execute
Copy the `action` object from step 2 and the `id` of the task. Send them to the execute endpoint. 

*(This is what your "Approve" button in Expo will do)*

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "userId": "user_123",
  "memoryItemId": "PASTE_THE_TASK_ID_HERE",
  "action": {
    "type": "create_github_issue",
    "payload": {
      "repo": "your-username/loop-backend",
      "title": "Fix broken login button - 404 Error",
      "body": "..."
    }
  }
}' "http://localhost:3000/api/execute"
```

---

## ⚡ Result
1.  Check your GitHub repository under **Issues**. You will see the new issue.
2.  Check your database. The task's `context` will now have a link to the GitHub issue!
