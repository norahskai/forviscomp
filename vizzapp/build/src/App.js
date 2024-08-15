import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [years, setYears] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedMonth1, setSelectedMonth1] = useState('');
  const [selectedMonth2, setSelectedMonth2] = useState('');
  const [chartData, setChartData] = useState(null);
  const [compareChartData, setCompareChartData] = useState(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get('http://localhost:5086/api/options');
        const { years } = response.data;
        setYears(years);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (selectedYear) {
        try {
          const response = await axios.get('http://localhost:5086/api/materials', {
            params: { year: selectedYear },
          });
          const materials = response.data.materials;
          materials.push('All'); // Add 'All' option at the end
          setMaterials(materials);
        } catch (error) {
          console.error('Error fetching materials:', error);
        }
      } else {
        setMaterials([]);
      }
    };

    fetchMaterials();
  }, [selectedYear]);

  useEffect(() => {
    const fetchMonths = async () => {
      if (selectedYear && selectedMaterial) {
        try {
          const response = await axios.get('http://localhost:5086/api/months', {
            params: { year: selectedYear, material: selectedMaterial },
          });
          setMonths(response.data.months);
        } catch (error) {
          console.error('Error fetching months:', error);
        }
      } else {
        setMonths([]);
      }
    };

    fetchMonths();
  }, [selectedMaterial, selectedYear]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5086/api/data', {
        params: {
          year: selectedYear,
          material: selectedMaterial,
        },
      });

      if (selectedMaterial === 'All') {
        const combinedData = response.data.data.reduce((acc, materialData) => {
          Object.keys(materialData).forEach((month) => {
            acc[month] = (acc[month] || 0) + materialData[month];
          });
          return acc;
        }, {});

        const chartData = {
          labels: Object.keys(combinedData),
          datasets: [
            {
              label: 'All Materials',
              data: Object.values(combinedData),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
            },
          ],
        };
        setChartData(chartData);
      } else {
        const chartData = {
          labels: Object.keys(response.data.data),
          datasets: [
            {
              label: selectedMaterial,
              data: Object.values(response.data.data),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
            },
          ],
        };
        setChartData(chartData);
      }
      setShowVisualization(true);
      setShowComparison(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const compareData = async () => {
    if (selectedMonth1 && selectedMonth2 && selectedYear) {
      try {
        const response = await axios.get('http://localhost:5086/api/compare', {
          params: {
            year: selectedYear,
            month1: selectedMonth1,
            month2: selectedMonth2,
          },
        });

        const compareData = response.data.map(item => ({
          material: item.material,
          percentageDifference: item.percentageDifference
        }));

        const compareChartData = {
          labels: compareData.map(item => item.material),
          datasets: [
            {
              label: 'Percentage Change',
              data: compareData.map(item => item.percentageDifference),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };

        setCompareChartData(compareChartData);
        setShowVisualization(false);
        setShowComparison(true);
      } catch (error) {
        console.error('Error comparing data:', error);
      }
    }
  };

  const clearData = () => {
    setSelectedMaterial('');
    setSelectedYear('');
    setSelectedMonth1('');
    setSelectedMonth2('');
    setChartData(null);
    setCompareChartData(null);
    setShowVisualization(false);
    setShowComparison(false);
  };

  return (
    <div className="App">
      <div className="form-container">
        
        <div>
          <label htmlFor="year-select">Select Year:</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">--Select Year--</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="material-select">Select Material:</label>
          <select
            id="material-select"
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
          >
            <option value="">--Select Material--</option>
            {materials.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>
        <button onClick={fetchData}>Visualize</button>
        <div>
          <label htmlFor="month1-select">Select Month 1:</label>
          <select
            id="month1-select"
            value={selectedMonth1}
            onChange={(e) => setSelectedMonth1(e.target.value)}
          >
            <option value="">--Select Month 1--</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month2-select">Select Month 2:</label>
          <select
            id="month2-select"
            value={selectedMonth2}
            onChange={(e) => setSelectedMonth2(e.target.value)}
          >
            <option value="">--Select Month 2--</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <button onClick={compareData}>Compare</button>
        <button onClick={clearData}>Clear</button>
      </div>
      <div className="visualization-container">
        {showVisualization && chartData && (
          <div className="chart-wrapper">
            <h2>Change across year {selectedYear} for {selectedMaterial}</h2>
            <div className="chart-container">
              <Line 
                data={chartData}
                options={{
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Month'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Volume'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
       
        {showComparison && compareChartData && (
                   <div className="chart-wrapper">
                   <h2>Comparison Visualization</h2>
                   <div className="chart-container">
                     <Bar 
                       data={compareChartData}
                       options={{
                         scales: {
                           x: {
                             title: {
                               display: true,
                               text: 'Material'
                             }
                           },
                           y: {
                             title: {
                               display: true,
                               text: 'Percentage Change'
                             }
                           }
                         }
                       }}
                     />
                   </div>
                 </div>
               )}
             </div>
           </div>
         );
       };
       
       export default App;