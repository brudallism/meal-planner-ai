# GitHub Setup Commands

After creating your GitHub repository, run these commands:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/meal-planner-ai.git

# Push to GitHub
git push -u origin main
```

# Expo Account Setup

1. **Create/Login to Expo Account**
   ```bash
   eas login
   ```
   
2. **Initialize EAS Project**
   ```bash
   eas init
   ```
   
3. **Update app.json with your EAS project ID**
   (EAS init will provide this)

4. **Start Expo with EAS integration**
   ```bash
   expo start
   ```

Now you'll be able to:
- Test on your device with Expo Go
- Access from your Expo account dashboard
- Share the project easily
- Deploy to app stores later

The project will show up in your Expo dashboard and be accessible via QR code in Expo Go!