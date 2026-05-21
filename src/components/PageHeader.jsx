function PageHeader({ title, description, actionLabel, onAction }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
        <p className="mt-2 text-slate-500">{description}</p>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default PageHeader;