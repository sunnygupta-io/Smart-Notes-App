
export interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: string;
}

const StatCard = ({ label, value, sub, icon }: StatCardProps)=> {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {sub && <p className="text-xs font-medium text-gray-400">{sub}</p>}
    </div>
  );
}

export default StatCard;