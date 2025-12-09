import React from 'react';
import { Card } from '@/components/ui/LayoutComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, DollarSign, Activity, ShoppingCart } from 'lucide-react';

const data = [
  { name: '周一', uv: 4000, pv: 2400, amt: 2400 },
  { name: '周二', uv: 3000, pv: 1398, amt: 2210 },
  { name: '周三', uv: 2000, pv: 9800, amt: 2290 },
  { name: '周四', uv: 2780, pv: 3908, amt: 2000 },
  { name: '周五', uv: 1890, pv: 4800, amt: 2181 },
  { name: '周六', uv: 2390, pv: 3800, amt: 2500 },
  { name: '周日', uv: 3490, pv: 4300, amt: 2100 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-emerald-500 font-medium">{trend}</span>
      <span className="text-slate-400 ml-2">较上月</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="总用户数" value="8,234" icon={Users} color="bg-indigo-500" trend="+12.5%" />
        <StatCard title="总收入" value="¥45,231" icon={DollarSign} color="bg-emerald-500" trend="+4.3%" />
        <StatCard title="活跃会话" value="1,432" icon={Activity} color="bg-amber-500" trend="+2.1%" />
        <StatCard title="总订单" value="856" icon={ShoppingCart} color="bg-rose-500" trend="+8.4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="收入概览" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="uv" stroke="#6366f1" fill="#e0e7ff" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="用户活跃度" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="pv" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;