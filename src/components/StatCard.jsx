function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        {Icon && (
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;