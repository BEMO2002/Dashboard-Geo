import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const pieData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];
const COLORS = ["#aa0000", "#0a4267", "#9E9E9E", "#13131A"];

const barData = [
  { name: "Jan", users: 400, sales: 240 },
  { name: "Feb", users: 300, sales: 139 },
  { name: "Mar", users: 200, sales: 980 },
  { name: "Apr", users: 278, sales: 390 },
  { name: "May", users: 189, sales: 480 },
];

const lineData = [
  { name: "Jan", visits: 120 },
  { name: "Feb", visits: 210 },
  { name: "Mar", visits: 180 },
  { name: "Apr", visits: 260 },
  { name: "May", visits: 300 },
  { name: "Jun", visits: 250 },
];

const Home = () => {
  return (
    <div className="min-h-screen  py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">
        Dashboard Overview
      </h1>
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4 text-second">
            Users Distribution
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4 text-second">
            Monthly Users & Sales
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#aa0000" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sales" fill="#0a4267" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4 text-second">
            Visits Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#aa0000"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;
