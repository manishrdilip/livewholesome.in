export function ChariotOverlay() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-deep via-emerald to-[#3a2a06]"
      style={{ animation: "chariot-overlay-in 0.25s ease-out" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #c9a227 0, transparent 35%), radial-gradient(circle at 80% 70%, #c9a227 0, transparent 35%)",
        }}
      />

      <div
        className="text-5xl"
        style={{ animation: "chariot-crown-pulse 1.4s ease-in-out infinite" }}
      >
        👑
      </div>

      <div className="relative mt-8 h-20 w-full overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div
            className="flex items-end gap-1 text-6xl"
            style={{ animation: "chariot-ride 1.5s cubic-bezier(0.42, 0, 0.58, 1) forwards" }}
          >
            <span style={{ animation: "chariot-gallop 0.32s ease-in-out infinite" }}>🐎</span>
            <span
              style={{ animation: "chariot-gallop 0.32s ease-in-out infinite 0.1s" }}
            >
              🐎
            </span>
            <span className="relative -ml-1 flex items-center">
              <span className="flex h-11 w-16 items-center justify-center rounded-md border-2 border-gold bg-gradient-to-b from-gold to-[#8a6a10] text-2xl shadow-lg">
                👑
              </span>
              <span
                className="absolute -bottom-2 left-2 h-4 w-4 rounded-full border-2 border-cream/80"
                style={{ animation: "chariot-wheel-spin 0.4s linear infinite" }}
              />
              <span
                className="absolute -bottom-2 right-2 h-4 w-4 rounded-full border-2 border-cream/80"
                style={{ animation: "chariot-wheel-spin 0.4s linear infinite" }}
              />
            </span>
            <span
              className="text-3xl opacity-70"
              style={{ animation: "chariot-dust 0.55s ease-out infinite" }}
            >
              💨
            </span>
          </div>
        </div>
      </div>

      <p
        className="mt-8 px-6 text-center font-serif text-xl font-semibold text-gold sm:text-2xl"
        style={{ animation: "chariot-text-in 0.5s ease-out 0.25s both" }}
      >
        Your royal order rides to checkout…
      </p>
      <p className="mt-2 text-sm text-cream/70">The drink of kings, delivered like one 👑</p>
    </div>
  );
}
