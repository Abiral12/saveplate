export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] animate-pulse px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <div className="h-64 rounded-[28px] bg-[#DCE5DC]" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-2xl border border-[#DFE6DE] bg-white"
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.55fr)]">
        <div className="h-[520px] rounded-[24px] bg-white" />
        <div className="h-[420px] rounded-[24px] bg-white" />
      </div>
    </div>
  );
}