// import React from 'react';
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// interface IngresosEgresosChartProps {
//   ingresos: number;
//   egresos: number;
// }

// const IngresosEgresosChart: React.FC<IngresosEgresosChartProps> = ({ ingresos, egresos }) => {
//   const data = [
//     { name: 'Ingresos', value: Math.abs(ingresos) },
//     { name: 'Egresos', value: Math.abs(egresos) },
//   ];

//   const COLORS = ['#0088FE', '#FF8042'];

//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
//     const RADIAN = Math.PI / 180;
//     const radius = outerRadius + 25; 
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
//         {`${data[index].name}: $${data[index].value}`}
//       </text>
//     );
//   };

//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <PieChart>
//         <Pie
//           data={data}
//           cx="50%"
//           cy="50%"
//           labelLine={true} // Habilitar las líneas de las etiquetas
//           outerRadius={100}
//           fill="#8884d8"
//           dataKey="value"
//           label={renderCustomizedLabel}
//         >
//           {data.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//         {/* <Legend /> */}
//       </PieChart>
//     </ResponsiveContainer>
//   );
// };

// export default IngresosEgresosChart;