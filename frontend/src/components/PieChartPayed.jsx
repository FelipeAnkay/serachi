import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const PieChartPayed = ({ totalPayedFiltered, notPayed }) => {
  const data = [
    { name: 'Payed', value: totalPayedFiltered },
    { name: 'Not Payed', value: notPayed }
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="w-full md:w-1/2 mx-auto mt-8 bg-sky-50 dark:bg-slate-800 p-4 rounded">
      <h3 className="text-lg font-semibold text-center mb-4 text-slate-900 dark:text-slate-100">
        Payed vs Not payed
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(2)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartPayed;