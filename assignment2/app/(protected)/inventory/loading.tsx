export default function InventoryLoading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] animate-pulse px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <div className="h-64 rounded-[28px] bg-[#DCE5DC]" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-2xl border border-[#DFE6DE] bg-white"
          />
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-[#DFE6DE] bg-white p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-[#E4EAE4]" />
            <div className="h-8 w-48 rounded bg-[#DCE5DC]" />
          </div>

          <div className="h-12 w-full rounded-xl bg-[#EEF2ED] xl:max-w-md" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-11 rounded-xl bg-[#EEF2ED]"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-80 rounded-2xl border border-[#DFE6DE] bg-[#FAFBF9]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}