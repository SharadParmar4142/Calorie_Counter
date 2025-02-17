# Calorie Counter

## Overview

Calorie Counter is a web application that allows users to register, log in, and manage their calorie intake by analyzing images of food. The application uses Node.js, Express, MongoDB, and integrates with Google Gemini for image analysis.

## Features

- User registration and login
- Password reset via email
- Image analysis to estimate calorie content
- Secure authentication using JWT
- Error handling and validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud account for Gemini API

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/Calorie_Counter.git
    cd Calorie_Counter
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```plaintext
    PORT=3000
    CONNECTION_STRING=your_mongodb_connection_string
    ACCESS_TOKEN_SECRET=your_access_token_secret
    API_KEY=your_google_gemini_api_key
    emailUser=your_email
    emailPassword=your_email_password
    CLIENT_ID=your_google_client_id
    CLIENT_SECRET=your_google_client_secret
    REDIRECT_URI=your_google_redirect_uri
    REFRESH_TOKEN=your_google_refresh_token
    ```

## Usage

1. Start the server:
    ```sh
    npm start
    ```

2. The server will be running on `http://localhost:3000`.

## API Endpoints

### User Registration

- **URL:** `/api/user/register`
- **Method:** `POST`
- **Body:**
    ```json
    {
        "username": "your_username",
        "email": "your_email@gmail.com",
        "password": "your_password"
    }
    ```

### User Login

- **URL:** `/api/user/login`
- **Method:** `POST`
- **Body:**
    ```json
    {
        "email": "your_email@gmail.com",
        "password": "your_password"
    }
    ```

### Forgot Password

- **URL:** `/api/user/forgotpassword`
- **Method:** `POST`
- **Body:**
    ```json
    {
        "username": "your_username",
        "email": "your_email@gmail.com"
    }
    ```

### Reset Password

- **URL:** `/api/user/resetpassword?token=your_token`
- **Method:** `POST`
- **Body:**
    ```json
    {
        "password": "your_new_password"
    }
    ```

### Image Analysis

- **URL:** `/api/user/run`
- **Method:** `POST`
- **Body:** (multipart/form-data)
    ```json
    {
        "image": "your_image_file"
    }
    ```

## Docker

To run the application using Docker:

1. Build the Docker image:
    ```sh
    docker build -t calorie-counter .
    ```

2. Run the Docker container:
    ```sh
    docker run -p 3000:3000 --env-file .env calorie-counter
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
