# SnapStudy

SnapStudy is an interactive flashcard platform that allows users to create, manage, and study flashcard sets across various categories. It features user authentication, search functionality, timed quizzes, and a user-friendly interface designed to enhance the study experience.

## Features

- **User Authentication**: Sign up and login functionality using Firebase authentication.
- **Flashcard Creation and Management**: Users can create, edit, and delete their own flashcard sets.
- **Search and Filter**: Search flashcard sets by title or filter them by category.
- **Timed Quizzes**: Users can set timers for quizzes and test their knowledge with multiple-choice questions.
- **Real-time Updates**: Flashcard sets, comments, and quiz results update in real-time using Firebase Firestore.
- **Admin Functionality**: Admins can manage users, reported comments, and flashcard sets.
- **User Profile**: Users can view and edit their profile, including updating their bio and name, which reflects across all components.

## Tech Stack

- **Frontend**: React, React Router DOM
- **Backend**: Firebase Firestore
- **Hosting**: Vercel
- **Authentication**: Firebase Authentication
- **Icons**: React Icons

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/schrodinger41/snapstudy.git
   ```

2. Navigate to the project directory:

   ```bash
   cd snapstudy
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up Firebase:

   - Create a Firebase project.
   - Enable Firebase Authentication and Firestore.
   - Create a `.env` file in the root directory with the following environment variables:
     ```bash
     REACT_APP_FIREBASE_API_KEY=your-api-key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
     REACT_APP_FIREBASE_PROJECT_ID=your-project-id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     REACT_APP_FIREBASE_APP_ID=your-app-id
     ```

5. Start the development server:

   ```bash
   npm start
   ```

   The app will be running on `http://localhost:3000`.

## Usage

- **Homepage**: Explore top flashcard sets, search by title, or filter by categories.
- **Create Flashcard Sets**: Users can create their own flashcards, edit, or delete them.
- **Quizzes**: Users can take quizzes with a set timer and multiple-choice answers.
- **Comments**: Users can leave comments on flashcard sets. Admins can manage reported comments.
- **Admin Panel**: Admins have access to manage users and moderate reported content.

## Project Structure

- `src/components`: Contains reusable components such as `Navbar`, `FlashcardSet`, etc.
- `src/pages`: Contains the main pages of the application such as `HomePage`, `SearchResultsPage`, `ProfilePage`, etc.
- `src/config`: Contains Firebase configuration files.
- `src/styles`: Contains the CSS files for styling the application.

## Contribution

If you'd like to contribute to SnapStudy, feel free to fork the repository, make changes, and submit a pull request. Contributions are always welcome!
