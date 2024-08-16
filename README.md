Visualization and Comparison Tool
Overview:
This project is a web-based application designed to visualize and compare material data across different years and months. It uses a React frontend to interact with a Node.js backend connected to a MongoDB database. Users can select a year, material, and months to visualize trends or compare changes.


Features:
Data Visualization: Users can visualize data for a selected material across a chosen year, displaying trends and changes month by month.

Data Comparison: Compare the percentage change in material data between two selected months within the same year.

Responsive Design: The application adapts to different screen sizes for a better user experience.


Technologies Used:
Frontend: React, Chart.js for data visualization

Backend: Node.js, Express.js

Database: MongoDB Atlas

Styling: CSS for layout and design


Installation and Setup:

1.Clone the repository:

git clone https://github.com/your-username/visualization-comparison-tool.git

cd visualization-comparison-tool


2.Install dependencies:
npm install


3.Set up environment variables:
Create a .env file in the root directory and add your MongoDB connection string:
PORT=5090 //it can be any number 
MONGODB_URI=your_mongodb_connection_string


4.Run the server:
cd backend //your backend direcory
node server.js


5.Run the frontend:
cd frontend //your frontend directory
npm run build
npm start


Project Structure:

1.App.js: The main component that handles state management, API requests, and renders the visualization and comparison UI.

2.server.js: Sets up the Express server, connects to MongoDB, and handles API endpoints for fetching data.

3.App.css: Contains styling for the layout and components of the application.


API Endpoints:

1.GET /api/options: Retrieves available years (collections) from the database.

2.GET /api/materials: Fetches available materials for a selected year.

3.GET /api/months: Retrieves available months for a selected year and material.

4.GET /api/data: Retrieves data for visualization based on selected year and material.

5.GET /api/compare: Compares data between two selected months for a specific year.


How to Use

1.Select Year: Choose the year you want to analyze data for.

2.Select Material: Choose a specific material or 'All' to visualize combined data.

3.Visualize Data: Click "Visualize" to display the line chart of data across the selected year.

4.Select Months: Choose two months to compare changes.

5.Compare Data: Click "Compare" to see a bar chart of percentage change between the two months.


Future Enhancements:

Add user authentication for personalized data access.

Implement data export features for reports.

Enhance chart interactivity with advanced tooltips and filtering options.


Contributing:

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

Contact: caroline.kar9@gmail.com


