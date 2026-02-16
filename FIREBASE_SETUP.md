# Firebase Setup Guide for Spelling Master

This guide will walk you through setting up Firebase authentication for the Spelling Master app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter a project name (e.g., "Spelling Master")
4. Follow the setup wizard
   - You can disable Google Analytics for development
5. Click **"Create project"**

## Step 2: Create a Web App

1. In your Firebase project, click the **Web** icon (</> symbol)
2. Enter an app nickname (e.g., "Spelling App")
3. Click **"Register app"**
4. Copy the Firebase config values shown on the next screen
5. Click **"Continue to console"**

## Step 3: Enable Google Sign-In

1. Go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Toggle "Enable"
4. Select a project support email
5. Click **"Save"**

For development/testing:
- Go to **Authentication** → **Users**
- You can add test users here
- Or just use your own Google account

## Step 4: Set Up Environment Variables

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase values from Step 2:
   ```
   REACT_APP_FIREBASE_API_KEY=xxx
   REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
   REACT_APP_FIREBASE_PROJECT_ID=xxx
   REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
   REACT_APP_FIREBASE_APP_ID=xxx
   ```

3. **Important**: Do NOT commit `.env.local` to git. It's already in `.gitignore`.

## Step 5: Start the App

```bash
npm run dev
```

Open `http://localhost:5173` and sign in with your Google account!

## Firestore Database Structure

When you first sign in, the app automatically creates the following structure in Firestore:

```
users/
  {userId}/
    words/
      {wordId}/
        - misspelled: string
        - correct: string
        - category: string
        - rule: string
        - attempts: number
        - correct_count: number
        - incorrect_count: number
        - lastTested: timestamp
        - createdAt: timestamp
```

**Note**: You don't need to manually create any collections. Firebase handles this automatically.

## Deploying to Production

When deploying to production (e.g., Vercel, Netlify):

1. Set environment variables in your hosting platform's dashboard:
   - Add each `REACT_APP_*` variable with the same value from `.env.local`

2. Update Firebase Security Rules (Optional but recommended):
   - In Firebase Console → Firestore Database → Rules
   - Replace default rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/words/{document=**} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

3. Update Google Authorized Redirect URIs:
   - In Google Cloud Console → OAuth 2.0 Client IDs
   - Add your production domain to authorized redirect URIs
   - Example: `https://yourdomain.com`

## Troubleshooting

### "Firebase SDK can't parse environment variables"
- Make sure your variable names start with `REACT_APP_`
- Restart `npm run dev` after changing `.env.local`

### "User not authorized to sign in"
- For development, enable Google sign-in and add your test users in Firebase Console
- Or just make sure your Gmail account is the project owner

### "Error: User not authenticated"
- Make sure you're signed in (check the profile icon in navbar)
- Clear browser cache and try signing in again

### "Words are not saving"
- Check Firestore Security Rules in Firebase Console
- Make sure you're signed in with the account that owns the app

## Questions?

If you encounter issues:
1. Check Firebase Console logs
2. Open browser DevTools (F12) and check the Console tab for errors
3. Make sure all environment variables are correctly set

Happy learning! 📝
