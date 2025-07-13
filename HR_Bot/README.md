# HR_Bot Documentation

## Project Overview
The HR_Bot project is designed to facilitate the generation of resumes in Word document format through a Microsoft Teams bot. The bot interacts with users to gather necessary information and utilizes a Python script to convert JSON data into a formatted Word document.

## Project Structure
```
HR_Bot
├── src
│   ├── docx_utils.py        # Contains utility methods for generating and manipulating Word documents.
│   └── teamsBot.js          # Defines the Teams bot and handles commands including resume generation.
├── templates
│   ├── left_logo_small.png   # Logo used in the header of the generated Word document.
│   └── right_logo_small.png  # Another logo used in the header of the generated Word document.
├── package.json              # Configuration for npm, including dependencies and scripts.
├── requirements.txt          # Lists Python dependencies required for the project.
└── README.md                 # Documentation for the project.
```

## Setup Instructions

### Prerequisites
- Node.js and npm installed on your machine.
- Python 3.x installed with necessary libraries for generating Word documents.

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd HR_Bot
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

### Running the Bot
To run the Teams bot, execute the following command:
```
node src/teamsBot.js
```

### Commands
- **/reset**: Deletes the current conversation state.
- **/count**: Returns the current count of messages in the conversation.
- **/diag**: Provides diagnostic information about the current activity.
- **/state**: Displays the current state of the conversation.
- **/runtime**: Shows the Node.js and SDK versions.
- **/upload**: Allows users to upload a PDF file for processing.
- **/makeresume**: Generates a resume based on user input. The bot will return a Word document instead of JSON.

### Modifying the /makeresume Command
The `/makeresume` command processes user input to generate a resume. It sends the resume data to a Python script that converts it into a Word document. The generated document is then sent back to the user as an attachment in the Teams chat.

### Example Usage
To generate a resume, a user can type:
```
/makeresume name John Doe jd "Software Engineer with 5 years of experience"
```

## Notes
- Ensure that the Python script responsible for converting JSON to a Word document is correctly implemented and executable.
- Test the integration thoroughly to confirm that the Word document is generated and sent successfully.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.