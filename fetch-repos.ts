import { getUserRepositories } from "./lib/github";

async function run() {
    try {
        const repos = await getUserRepositories();
        console.log("REPOS_FOUND:", JSON.stringify(repos.slice(0, 3)));
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
