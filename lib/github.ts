/**
 * GitHub Service Layer
 * Level 2: Simple issue creation and PR drafting via Personal Access Token.
 */

export async function createGithubIssue(repo: string, title: string, body: string) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("Missing GITHUB_TOKEN in environment variables.");
    }

    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Loop-Backend-Assistant",
        },
        body: JSON.stringify({ title, body }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
}

/**
 * Note: Since we are Level 2 (Drafting), we might not actually "create" the PR here,
 * but rather just prepare the data. However, the requirement says "prepares real work".
 * For PRs, we'll implement a way to post a comment or just return the drafted text.
 */
export async function draftPRDescription(repo: string, title: string, body: string) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("Missing GITHUB_TOKEN in environment variables.");
    }

    // Validate the repo exists before "drafting"
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Loop-Backend-Assistant",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub Repo Not Found: ${repo}. Please fix the repository name.`);
    }

    return {
        message: "PR description drafted successfully (not yet posted to GitHub)",
        repo,
        title,
        body,
    };
}

/**
 * Fetch the authenticated user's repositories.
 */
export async function getUserRepositories() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("Missing GITHUB_TOKEN in environment variables.");
    }

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Loop-Backend-Assistant",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }

    const repos = await response.json();
    return repos.map((repo: any) => ({
        id: repo.id,
        full_name: repo.full_name,
        name: repo.name,
    }));
}
