# Solar Panel Maintenance Tracker (SolarCare)

A responsive EEE mini-project web application to register solar panels, record energy generation, track faults and maintain service history.

## Run locally
1. Extract the ZIP file.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Add a panel, record generation and add a maintenance entry.
5. Click **Fetch weather data** to test the Fetch API integration. Internet access is required for this feature.

## Features
- Responsive HTML5, CSS3, Bootstrap 5 and CSS Grid-based layout.
- JavaScript validation and DOM-based add, delete, status update, search and filter.
- Dashboard totals for registered, active and faulty panels and energy generation.
- Browser `localStorage` persistence (data stays in the same browser/device).
- Fetch API with asynchronous `async/await`, HTTP error handling and `try/catch/finally`.
- TypeScript classes, constructor, methods, object creation and inheritance in `src/models.ts`.
- Linux shell scripts for setup and recurring maintenance reminder logs.

## TypeScript demonstration
Install Node.js and TypeScript, then run:
```bash
npm install -g typescript
tsc src/models.ts --target ES2020 --outDir dist
node dist/models.js
```

## Linux shell script
From the project directory:
```bash
chmod +x scripts/*.sh
./scripts/setup.sh
./scripts/daily-summary.sh
```

## Cron scheduling (Linux)
Edit the current user's crontab:
```bash
crontab -e
```
Add this line, replacing `/absolute/path/to/solar-panel-maintenance-tracker` with the actual project directory:
```cron
0 8 * * * /absolute/path/to/solar-panel-maintenance-tracker/scripts/daily-summary.sh
```
This runs the reminder script every day at 8:00 AM. Verify with:
```bash
crontab -l
```
Cron is a local Linux task; GitHub Pages itself does not run cron jobs.

## Git workflow: clone, branch, commit and merge
Create an empty GitHub repository first, then:
```bash
git clone https://github.com/YOUR-USERNAME/solar-panel-maintenance-tracker.git
cd solar-panel-maintenance-tracker
git switch -c feature/panel-registration
git add .
git commit -m "Add solar panel registration and dashboard"
git push -u origin feature/panel-registration
```
Open a Pull Request on GitHub. After review, merge it into `main`:
```bash
git switch main
git pull origin main
git merge feature/panel-registration
git push origin main
```

## GitHub collaboration evidence: fork, pull request and conflict resolution
1. A second team member forks the repository using GitHub's **Fork** button.
2. The teammate clones their fork, creates a feature branch, edits a file, commits and pushes.
3. The teammate opens a Pull Request from their fork to the original repository.
4. The project owner reviews and merges the Pull Request.
5. To demonstrate a merge conflict, make different edits to the same line in the same file on two branches, then merge. Git marks conflict sections with `<<<<<<<`, `=======` and `>>>>>>>`.
6. Edit the file to retain the correct combined content, remove the markers, then run:
```bash
git add .
git commit -m "Resolve merge conflict"
git push
```
Take screenshots of the fork, PR page, merged PR and conflict resolution for the project record. Do not claim these steps were completed until your team actually performs them.

## GitHub Pages deployment
1. Push the project files to the repository's `main` branch.
2. Open repository **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`, then click **Save**.
5. Wait for the Pages deployment and open the published URL shown in Settings → Pages.

The `index.html`, `style.css` and `app.js` files are static and can be hosted on GitHub Pages. TypeScript source and Linux cron scripts are included as implementation evidence; GitHub Pages does not execute shell scripts or schedule cron jobs.

## Important project limitations
- This is a front-end prototype. It stores data in the browser's localStorage, not in a shared database. Different browsers/devices will not share records.
- Generation values are entered by the user; the weather API is contextual information and does not measure actual panel output.
- A real installation would need inverter/meter integration, authentication, a backend API and a database.
