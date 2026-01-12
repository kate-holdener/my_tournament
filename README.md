# Chess Tournament Web Site Template

## How to use this template to host a tournament web site

1. Create a new repository from this template 
   - Click on "Use this template" button, on the top right
   - Select "Create new repository"
   - Give your new repository a name
   - Select "include all branches"
1. When your repository gets created, navigate to "Settings" within your repository, to enable GitHub Pages
   - Select "Pages"
   - Under "Build and Deployment", in Source drop-down, select "GitHub Actions"
1. Update the tournament configuration in the config/tournament-config.json file with your tournament specific values. The following fields are optional (remove them if not needed):
   - sponsorName


## Run Locally (for developers)

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
1. Run the app:
   `npm run dev`
